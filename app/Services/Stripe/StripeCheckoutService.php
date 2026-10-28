<?php

namespace App\Services\Stripe;

use App\Exceptions\CheckoutException;
use App\Models\Package;
use App\Models\PublishPackage;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;
use Stripe\Price;
use Stripe\Stripe;
use Stripe\StripeClient;

class StripeCheckoutService
{
    public function __construct(?StripeClient $client = null)
    {
        $secret = config('services.stripe.secret');

        if (! $secret) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                'STRIPE_SECRET is not configured',
                503
            );
        }

        Stripe::setApiKey($secret);
        $this->client = $client ?? new StripeClient($secret);
    }

    protected StripeClient $client;

    /**
     * Whether the configured secret key is a test key.
     */
    public function isTestMode(): bool
    {
        $secret = (string) config('services.stripe.secret');

        return str_starts_with($secret, 'sk_test_');
    }

    public function isLiveMode(): bool
    {
        $secret = (string) config('services.stripe.secret');

        return str_starts_with($secret, 'sk_live_');
    }

    /**
     * Acquire a short-lived lock to prevent duplicate checkout clicks.
     * Caller must release via the returned lock (or it auto-expires).
     *
     * @return \Illuminate\Contracts\Cache\Lock
     */
    public function acquireCheckoutLock(int $userId): \Illuminate\Contracts\Cache\Lock
    {
        $lock = Cache::lock("stripe-checkout:{$userId}", 30);

        if (! $lock->get()) {
            throw new CheckoutException(
                'Checkout is already in progress. Please wait a moment.',
                "Duplicate checkout lock held for user {$userId}",
                429
            );
        }

        return $lock;
    }

    public function userHasActiveSubscription(User $user): bool
    {
        return Subscription::where('user_id', $user->id)
            ->whereIn('stripe_status', ['active', 'trialing'])
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->exists();
    }

    public function resolveSubscriptionPackage(int $packageId): Package
    {
        $package = Package::where('id', $packageId)->where('is_active', true)->first();

        if (! $package) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Inactive or missing subscription package #{$packageId}",
                404
            );
        }

        return $package;
    }

    public function resolvePublishPackage(int $packageId): PublishPackage
    {
        $package = PublishPackage::where('id', $packageId)->where('is_active', true)->first();

        if (! $package) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Inactive or missing publish package #{$packageId}",
                404
            );
        }

        return $package;
    }

    /**
     * Non-throwing check used by the public catalog: does this Price exist
     * and belong to the currently configured Stripe account/mode?
     */
    public function isPriceAvailableForCurrentAccount(string $priceId): bool
    {
        $cacheKey = $this->priceAvailabilityCacheKey($priceId);

        return (bool) Cache::remember($cacheKey, now()->addMinutes(10), function () use ($priceId) {
            try {
                $this->assertPricePurchasable($priceId, 'catalog filter');

                return true;
            } catch (CheckoutException $e) {
                Log::info('Package catalog excluding Stripe price', [
                    'price_id' => $priceId,
                    'reason' => $e->logContext(),
                ]);

                return false;
            } catch (\Throwable $e) {
                Log::warning('Package catalog Stripe check failed', [
                    'price_id' => $priceId,
                    'message' => $e->getMessage(),
                ]);

                return false;
            }
        });
    }

    public function forgetPriceAvailabilityCache(?string $priceId = null): void
    {
        if ($priceId) {
            Cache::forget($this->priceAvailabilityCacheKey($priceId));

            return;
        }

        // Best-effort: key fingerprint change already isolates cache per Stripe account.
    }

    protected function priceAvailabilityCacheKey(string $priceId): string
    {
        $secret = (string) config('services.stripe.secret');
        $fingerprint = substr(hash('sha256', $secret), 0, 16);

        return "stripe_price_ok:{$fingerprint}:{$priceId}";
    }

    /**
     * Ensure the package was created under the currently configured Stripe account.
     */
    public function assertPackageBelongsToCurrentAccount(Package $package): void
    {
        $accountId = app(StripeAccountService::class)->currentAccountId();

        if (! $accountId) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                'Unable to resolve current Stripe account for package #'.$package->id,
                503
            );
        }

        if (! empty($package->stripe_account_id)
            && ! hash_equals((string) $package->stripe_account_id, (string) $accountId)) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Package #{$package->id} belongs to Stripe account {$package->stripe_account_id}, current is {$accountId}",
                422
            );
        }

        // Legacy unstamped rows: require a live Price that resolves on this account, then stamp.
        if (empty($package->stripe_account_id)) {
            if ((int) ($package->price_cents ?? 0) === 0) {
                $package->forceFill(['stripe_account_id' => $accountId])->save();

                return;
            }

            $meta = $this->assertPricePurchasable(
                (string) ($package->stripe_price_id ?? ''),
                "subscription package #{$package->id}"
            );

            $package->forceFill([
                'stripe_account_id' => $accountId,
                'stripe_product_id' => $meta['product_id'] ?? $package->stripe_product_id,
            ])->save();
        }
    }

    /**
     * Validate that a Stripe Price is purchasable with the current API keys.
     *
     * @return array{price_id: string, product_id: string, livemode: bool}
     */
    public function assertPricePurchasable(string $priceId, string $context = 'package'): array
    {
        if ($priceId === '' || ! str_starts_with($priceId, 'price_')) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Invalid Stripe price id for {$context}: {$priceId}",
                422
            );
        }

        try {
            $price = $this->client->prices->retrieve($priceId, ['expand' => ['product']]);
        } catch (ApiErrorException $e) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Stripe price retrieve failed for {$priceId}: ".$e->getMessage(),
                422,
                $e
            );
        }

        if (! $price->active) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Stripe price {$priceId} is inactive",
                422
            );
        }

        $product = $price->product;
        $productId = is_object($product) ? $product->id : (string) $product;
        $productActive = is_object($product) ? (bool) $product->active : true;

        if (! $productActive) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Stripe product {$productId} for price {$priceId} is inactive",
                422
            );
        }

        $priceIsLive = (bool) $price->livemode;
        if ($this->isTestMode() && $priceIsLive) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Test/live Price ID mismatch: test keys used with live price {$priceId}",
                422
            );
        }

        if ($this->isLiveMode() && ! $priceIsLive) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Test/live Price ID mismatch: live keys used with test price {$priceId}",
                422
            );
        }

        return [
            'price_id' => $price->id,
            'product_id' => $productId,
            'livemode' => $priceIsLive,
        ];
    }

    /**
     * Ensure the user has a Stripe customer (Cashier stripe_id).
     */
    public function ensureCustomer(User $user): string
    {
        if (! empty($user->stripe_id)) {
            try {
                $this->client->customers->retrieve($user->stripe_id);

                return $user->stripe_id;
            } catch (ApiErrorException $e) {
                Log::warning('Stored Stripe customer missing; recreating', [
                    'user_id' => $user->id,
                    'stripe_id' => $user->stripe_id,
                ]);
            }
        }

        try {
            $customer = $this->client->customers->create([
                'email' => $user->email,
                'name' => $user->name,
                'metadata' => [
                    'user_id' => (string) $user->id,
                ],
            ], [
                'idempotency_key' => 'customer_user_'.$user->id,
            ]);
        } catch (ApiErrorException $e) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                'Stripe customer create failed: '.$e->getMessage(),
                502,
                $e
            );
        }

        $user->forceFill(['stripe_id' => $customer->id])->save();

        return $customer->id;
    }

    /**
     * Create a subscription Checkout Session from authoritative package data.
     */
    public function createSubscriptionCheckoutSession(User $user, Package $package): Session
    {
        if ((int) ($package->price_cents ?? 0) === 0) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Package #{$package->id} is free; use free activation path",
                422
            );
        }

        if (empty($package->stripe_price_id) || ! str_starts_with((string) $package->stripe_price_id, 'price_')) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Package #{$package->id} is missing a valid stripe_price_id",
                422
            );
        }

        $this->assertPackageBelongsToCurrentAccount($package);
        $meta = $this->assertPricePurchasable($package->stripe_price_id, "subscription package #{$package->id}");

        if (! empty($package->stripe_product_id)
            && ! hash_equals((string) $package->stripe_product_id, (string) $meta['product_id'])) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Package #{$package->id} product mismatch: stored {$package->stripe_product_id}, live {$meta['product_id']}",
                422
            );
        }

        $customerId = $this->ensureCustomer($user);
        $domain = rtrim((string) config('app.url'), '/');

        $params = [
            'mode' => 'subscription',
            'customer' => $customerId,
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $package->stripe_price_id,
                'quantity' => 1,
            ]],
            'success_url' => $domain.'/stripe/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $domain.'/stripe/cancel',
            'client_reference_id' => (string) $user->id,
            'metadata' => [
                'user_id' => (string) $user->id,
                'package_id' => (string) $package->id,
                'checkout_type' => 'subscription',
            ],
            'subscription_data' => [
                'metadata' => [
                    'user_id' => (string) $user->id,
                    'package_id' => (string) $package->id,
                ],
            ],
        ];

        try {
            return $this->client->checkout->sessions->create($params, [
                'idempotency_key' => $this->idempotencyKey('sub', $user->id, $package->id),
            ]);
        } catch (ApiErrorException $e) {
            throw $this->mapStripeApiError($e, 'subscription checkout');
        }
    }

    /**
     * Create a one-time payment Checkout Session for story publishing.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function createPublishCheckoutSession(
        User $user,
        PublishPackage $package,
        array $metadata = [],
        ?int $overrideAmountCents = null,
    ): Session {
        $domain = rtrim((string) config('app.url'), '/');
        $customerId = $this->ensureCustomer($user);

        $amountCents = $overrideAmountCents;
        if ($amountCents === null) {
            $amountCents = (int) round(((float) $package->price) * 100);
        }

        if ($amountCents < 50) {
            throw new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "Publish package #{$package->id} amount too low: {$amountCents}",
                422
            );
        }

        $lineItems = [];
        $priceId = $package->stripe_price_id;

        // Only use Stripe Price when valid and amount matches (no client-trusted discounts on price IDs).
        if ($priceId && str_starts_with((string) $priceId, 'price_') && $overrideAmountCents === null) {
            $this->assertPricePurchasable($priceId, "publish package #{$package->id}");
            $lineItems[] = [
                'price' => $priceId,
                'quantity' => 1,
            ];
        } else {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => ($metadata['story_title'] ?? $package->name).' Publication',
                        'description' => 'One-time payment for story publication review',
                    ],
                    'unit_amount' => $amountCents,
                ],
                'quantity' => 1,
            ];
        }

        $params = [
            'mode' => 'payment',
            'customer' => $customerId,
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'success_url' => $domain.'/stripe/publish-success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $domain.'/stripe/publish-cancel',
            'client_reference_id' => (string) $user->id,
            'metadata' => array_merge([
                'user_id' => (string) $user->id,
                'package_id' => (string) $package->id,
                'checkout_type' => 'publish',
            ], $metadata),
        ];

        try {
            return $this->client->checkout->sessions->create($params, [
                'idempotency_key' => $this->idempotencyKey('pub', $user->id, $package->id, $amountCents),
            ]);
        } catch (ApiErrorException $e) {
            throw $this->mapStripeApiError($e, 'publish checkout');
        }
    }

    public function retrieveCheckoutSession(string $sessionId): Session
    {
        try {
            return $this->client->checkout->sessions->retrieve($sessionId, [
                'expand' => ['subscription', 'payment_intent'],
            ]);
        } catch (ApiErrorException $e) {
            throw new CheckoutException(
                'Your payment could not be verified. Please contact support if you were charged.',
                'Session retrieve failed: '.$e->getMessage(),
                400,
                $e
            );
        }
    }

    public function retrieveSubscription(string $subscriptionId): \Stripe\Subscription
    {
        return $this->client->subscriptions->retrieve($subscriptionId);
    }

    protected function idempotencyKey(string $prefix, int $userId, int $packageId, ?int $amount = null): string
    {
        // 30-second window reduces duplicate charges from double-clicks without
        // permanently blocking legitimate retries.
        $window = (int) floor(time() / 30);

        return implode('_', array_filter([
            $prefix,
            'u'.$userId,
            'p'.$packageId,
            $amount !== null ? 'a'.$amount : null,
            'w'.$window,
        ]));
    }

    protected function mapStripeApiError(ApiErrorException $e, string $context): CheckoutException
    {
        $code = $e->getStripeCode() ?: $e->getError()?->code;
        $message = $e->getMessage();

        Log::error("Stripe API error during {$context}", [
            'stripe_code' => $code,
            'stripe_type' => $e->getError()?->type,
            'message' => $message,
        ]);

        $userMessage = match ($code) {
            'card_declined' => 'Your payment could not be completed. Please check your details or try another payment method.',
            'expired_card' => 'Your card has expired. Please try another payment method.',
            'insufficient_funds' => 'Your payment could not be completed. Please try another payment method.',
            'authentication_required' => 'Additional authentication is required. Please try again and complete verification.',
            'resource_missing' => "We couldn't start checkout right now. Please try again.",
            default => "We couldn't start checkout right now. Please try again.",
        };

        if (str_contains(strtolower($message), 'product is not active')
            || str_contains(strtolower($message), 'not available to be purchased')) {
            $userMessage = "We couldn't start checkout right now. Please try again.";
        }

        $status = in_array($e->getHttpStatus(), [400, 402, 404, 409, 429], true)
            ? (int) $e->getHttpStatus()
            : 502;

        return new CheckoutException($userMessage, "{$context}: {$message}", $status, $e);
    }
}
