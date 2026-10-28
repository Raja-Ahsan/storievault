<?php

namespace App\Services\Stripe;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeAccountService
{
    public function __construct(?StripeClient $client = null)
    {
        $secret = config('services.stripe.secret');
        $this->client = $client ?? ($secret ? new StripeClient($secret) : null);
    }

    protected ?StripeClient $client;

    /**
     * Stripe Account ID for the currently configured secret key (acct_…).
     * Cached per secret fingerprint so key changes invalidate automatically.
     */
    public function currentAccountId(): ?string
    {
        $secret = (string) config('services.stripe.secret');
        if ($secret === '' || ! $this->client) {
            return null;
        }

        $cacheKey = 'stripe_account_id:'.substr(hash('sha256', $secret), 0, 16);

        return Cache::remember($cacheKey, now()->addHours(6), function () {
            try {
                $account = $this->client->accounts->retrieve();

                return $account->id ?? null;
            } catch (ApiErrorException $e) {
                Log::error('Unable to resolve current Stripe account', [
                    'message' => $e->getMessage(),
                ]);

                return null;
            } catch (\Throwable $e) {
                Log::error('Unable to resolve current Stripe account', [
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    public function isTestMode(): bool
    {
        return str_starts_with((string) config('services.stripe.secret'), 'sk_test_');
    }

    public function isLiveMode(): bool
    {
        return str_starts_with((string) config('services.stripe.secret'), 'sk_live_');
    }

    public function forgetCachedAccountId(): void
    {
        $secret = (string) config('services.stripe.secret');
        Cache::forget('stripe_account_id:'.substr(hash('sha256', $secret), 0, 16));
    }
}
