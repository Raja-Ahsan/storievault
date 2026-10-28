<?php

namespace App\Services\Stripe;

use App\Models\Package;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class PackageCatalogService
{
    public function __construct(
        protected StripeCheckoutService $checkout,
        protected StripeAccountService $accounts,
    ) {
    }

    /**
     * Current Stripe account id, or null if keys are missing/invalid.
     */
    public function currentStripeAccountId(): ?string
    {
        return $this->accounts->currentAccountId();
    }

    /**
     * Public packages for the currently configured Stripe account only.
     */
    public function publiclyPurchasable(): Collection
    {
        $accountId = $this->currentStripeAccountId();
        if (! $accountId) {
            return collect();
        }

        $this->stampLegacyPackagesForAccount($accountId);

        return Package::query()
            ->publiclyListed()
            ->forStripeAccount($accountId)
            ->orderBy('price_cents')
            ->get()
            ->filter(fn (Package $package) => $this->passesLivePriceGuard($package))
            ->values();
    }

    /**
     * Admin listing: only packages for the current Stripe account.
     */
    public function adminPackagesForCurrentAccount(int $perPage = 10): LengthAwarePaginator
    {
        $accountId = $this->currentStripeAccountId();

        if ($accountId) {
            $this->stampLegacyPackagesForAccount($accountId);
        }

        $query = Package::query()->orderByDesc('id');

        if ($accountId) {
            $query->forStripeAccount($accountId);
        } else {
            // Invalid/missing keys → show nothing rather than leaking other accounts.
            $query->whereRaw('1 = 0');
        }

        $paginator = $query->paginate($perPage);

        $paginator->getCollection()->transform(function (Package $package) use ($accountId) {
            $package->setAttribute('stripe_compatible', true);
            $package->setAttribute('stripe_account_id', $package->stripe_account_id ?: $accountId);

            return $package;
        });

        return $paginator;
    }

    public function belongsToCurrentAccount(Package $package): bool
    {
        $accountId = $this->currentStripeAccountId();
        if (! $accountId) {
            return false;
        }

        if (! empty($package->stripe_account_id)) {
            return hash_equals((string) $package->stripe_account_id, (string) $accountId);
        }

        return $this->tryStampLegacyPackage($package, $accountId);
    }

    public function isPurchasableWithCurrentStripe(Package $package): bool
    {
        if (! $this->belongsToCurrentAccount($package)) {
            return false;
        }

        if ((int) ($package->price_cents ?? 0) === 0) {
            return true;
        }

        return $this->passesLivePriceGuard($package);
    }

    /**
     * Soft live check so deleted/inactive Stripe prices are not offered at checkout time.
     */
    protected function passesLivePriceGuard(Package $package): bool
    {
        if ((int) ($package->price_cents ?? 0) === 0) {
            return true;
        }

        $priceId = (string) ($package->stripe_price_id ?? '');
        if ($priceId === '' || ! str_starts_with($priceId, 'price_')) {
            return false;
        }

        return $this->checkout->isPriceAvailableForCurrentAccount($priceId);
    }

    /**
     * Attempt to associate unstamped legacy packages that resolve under the current keys.
     */
    protected function stampLegacyPackagesForAccount(string $accountId): void
    {
        Package::query()
            ->whereNull('stripe_account_id')
            ->where('is_active', true)
            ->orderBy('id')
            ->limit(100)
            ->get()
            ->each(function (Package $package) use ($accountId) {
                $this->tryStampLegacyPackage($package, $accountId);
            });
    }

    /**
     * One-time stamp for legacy packages that still resolve under the current keys.
     */
    protected function tryStampLegacyPackage(Package $package, string $accountId): bool
    {
        // Free packages without a Price cannot be verified against Stripe — leave unstamped.
        if ((int) ($package->price_cents ?? 0) === 0) {
            return false;
        }

        $priceId = (string) ($package->stripe_price_id ?? '');
        if ($priceId === '' || ! str_starts_with($priceId, 'price_')) {
            return false;
        }

        if (! $this->checkout->isPriceAvailableForCurrentAccount($priceId)) {
            return false;
        }

        try {
            $meta = $this->checkout->assertPricePurchasable($priceId, 'legacy stamp');
            $package->forceFill([
                'stripe_account_id' => $accountId,
                'stripe_product_id' => $meta['product_id'] ?? $package->stripe_product_id,
            ])->save();

            return true;
        } catch (\Throwable $e) {
            Log::info('Legacy package stamp skipped', [
                'package_id' => $package->id,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
