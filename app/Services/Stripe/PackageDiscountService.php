<?php

namespace App\Services\Stripe;

use App\Models\Package;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class PackageDiscountService
{
    public function __construct(protected StripeClient $client)
    {
    }

    /**
     * Sync (create/replace/deactivate) the Stripe Coupon for a package discount.
     */
    public function sync(Package $package): Package
    {
        if (! $package->discount_enabled || ! $package->hasActiveDiscountWindow()) {
            return $this->deactivateCoupon($package);
        }

        if ((int) ($package->price_cents ?? 0) <= 0) {
            return $this->deactivateCoupon($package);
        }

        if (empty($package->stripe_product_id)) {
            Log::warning('Package discount sync skipped: missing stripe_product_id', [
                'package_id' => $package->id,
            ]);

            return $package;
        }

        $desired = $this->fingerprint($package);

        if ($package->stripe_coupon_id) {
            try {
                $existing = $this->client->coupons->retrieve($package->stripe_coupon_id);
                $existingFingerprint = data_get($existing->metadata, 'discount_fingerprint');

                if ($existing->valid
                    && $existingFingerprint
                    && hash_equals((string) $existingFingerprint, $desired)
                ) {
                    return $package;
                }

                $this->client->coupons->update($package->stripe_coupon_id, ['metadata' => [
                    'package_id' => (string) $package->id,
                    'replaced' => '1',
                ]]);
                $this->client->coupons->delete($package->stripe_coupon_id);
            } catch (ApiErrorException $e) {
                Log::info('Previous package coupon could not be retrieved/deleted; creating new', [
                    'package_id' => $package->id,
                    'coupon_id' => $package->stripe_coupon_id,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        $params = $this->buildCouponParams($package, $desired);

        try {
            $coupon = $this->client->coupons->create($params);
        } catch (ApiErrorException $e) {
            Log::error('Stripe coupon create failed for package discount', [
                'package_id' => $package->id,
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }

        $package->forceFill(['stripe_coupon_id' => $coupon->id])->save();

        return $package->fresh();
    }

    /**
     * Deactivate any linked Stripe coupon and clear the local reference when discount is off.
     */
    public function deactivateCoupon(Package $package): Package
    {
        if ($package->stripe_coupon_id) {
            try {
                $this->client->coupons->delete($package->stripe_coupon_id);
            } catch (ApiErrorException $e) {
                Log::info('Stripe coupon deactivate skipped', [
                    'package_id' => $package->id,
                    'coupon_id' => $package->stripe_coupon_id,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        if ($package->stripe_coupon_id !== null) {
            $package->forceFill(['stripe_coupon_id' => null])->save();
        }

        return $package->fresh() ?? $package;
    }

    /**
     * Coupon id to auto-apply at checkout, or null when discount should not apply.
     */
    public function checkoutCouponId(Package $package): ?string
    {
        if (! $package->shouldApplyDiscountAtCheckout()) {
            return null;
        }

        return $package->stripe_coupon_id;
    }

    protected function buildCouponParams(Package $package, string $fingerprint): array
    {
        $params = [
            'name' => mb_substr($package->name.' discount', 0, 40),
            'duration' => $package->discount_duration,
            'applies_to' => [
                'products' => [$package->stripe_product_id],
            ],
            'metadata' => [
                'package_id' => (string) $package->id,
                'discount_fingerprint' => $fingerprint,
            ],
        ];

        if ($package->discount_duration === 'repeating') {
            $params['duration_in_months'] = (int) $package->discount_duration_in_months;
        }

        if ($package->discount_type === 'percentage') {
            $params['percent_off'] = (float) $package->discount_value;
        } else {
            $params['amount_off'] = (int) $package->discount_value;
            $params['currency'] = 'usd';
        }

        if ($package->discount_ends_at) {
            $params['redeem_by'] = $package->discount_ends_at->getTimestamp();
        }

        return $params;
    }

    protected function fingerprint(Package $package): string
    {
        return hash('sha256', implode('|', [
            $package->discount_type,
            (string) $package->discount_value,
            $package->discount_duration,
            (string) $package->discount_duration_in_months,
            (string) optional($package->discount_ends_at)?->timestamp,
            (string) $package->stripe_product_id,
        ]));
    }
}
