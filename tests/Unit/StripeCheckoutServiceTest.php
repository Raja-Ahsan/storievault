<?php

namespace Tests\Unit;

use App\Exceptions\CheckoutException;
use App\Services\Stripe\StripeCheckoutService;
use Mockery;
use Stripe\Service\PriceService;
use Stripe\StripeClient;
use Tests\TestCase;

class StripeCheckoutServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_assert_price_rejects_invalid_price_id_format(): void
    {
        config(['services.stripe.secret' => 'sk_test_fake']);

        $service = new StripeCheckoutService(Mockery::mock(StripeClient::class));

        $this->expectException(CheckoutException::class);
        $service->assertPricePurchasable('testing', 'publish package');
    }

    public function test_assert_price_rejects_live_price_with_test_keys(): void
    {
        config(['services.stripe.secret' => 'sk_test_fake']);

        $priceService = Mockery::mock(PriceService::class);
        $priceService->shouldReceive('retrieve')->once()->andReturn((object) [
            'id' => 'price_live_1',
            'active' => true,
            'livemode' => true,
            'product' => (object) ['id' => 'prod_1', 'active' => true],
        ]);

        $client = Mockery::mock(StripeClient::class);
        $client->prices = $priceService;

        $service = new StripeCheckoutService($client);

        try {
            $service->assertPricePurchasable('price_live_1');
            $this->fail('Expected CheckoutException');
        } catch (CheckoutException $e) {
            $this->assertStringContainsString('Test/live Price ID mismatch', $e->logContext());
            $this->assertSame("We couldn't start checkout right now. Please try again.", $e->userMessage());
        }
    }

    public function test_assert_price_rejects_inactive_product(): void
    {
        config(['services.stripe.secret' => 'sk_test_fake']);

        $priceService = Mockery::mock(PriceService::class);
        $priceService->shouldReceive('retrieve')->once()->andReturn((object) [
            'id' => 'price_test_1',
            'active' => true,
            'livemode' => false,
            'product' => (object) ['id' => 'prod_inactive', 'active' => false],
        ]);

        $client = Mockery::mock(StripeClient::class);
        $client->prices = $priceService;

        $service = new StripeCheckoutService($client);

        $this->expectException(CheckoutException::class);
        $service->assertPricePurchasable('price_test_1');
    }
}
