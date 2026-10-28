<?php

namespace Tests\Unit;

use App\Exceptions\CheckoutException;
use App\Services\Stripe\StripeCheckoutService;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Stripe\StripeClient;
use Tests\TestCase;

class StripePriceAvailabilityTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_is_price_available_caches_negative_result_for_missing_price(): void
    {
        config(['services.stripe.secret' => 'sk_test_catalog_account']);
        Cache::flush();

        $service = Mockery::mock(StripeCheckoutService::class, [Mockery::mock(StripeClient::class)])
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $service->shouldReceive('assertPricePurchasable')
            ->once()
            ->with('price_missing', 'catalog filter')
            ->andThrow(new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                "No such price: 'price_missing'",
                422
            ));

        $this->assertFalse($service->isPriceAvailableForCurrentAccount('price_missing'));
        // Second call hits cache — assertPricePurchasable must not run again
        $this->assertFalse($service->isPriceAvailableForCurrentAccount('price_missing'));
    }

    public function test_is_price_available_returns_true_when_price_belongs_to_account(): void
    {
        config(['services.stripe.secret' => 'sk_test_catalog_account']);
        Cache::flush();

        $service = Mockery::mock(StripeCheckoutService::class, [Mockery::mock(StripeClient::class)])
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $service->shouldReceive('assertPricePurchasable')
            ->once()
            ->andReturn([
                'price_id' => 'price_ok',
                'product_id' => 'prod_ok',
                'livemode' => false,
            ]);

        $this->assertTrue($service->isPriceAvailableForCurrentAccount('price_ok'));
    }
}
