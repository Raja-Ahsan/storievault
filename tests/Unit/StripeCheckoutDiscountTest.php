<?php

namespace Tests\Unit;

use App\Models\Package;
use App\Models\User;
use App\Services\Stripe\PackageDiscountService;
use App\Services\Stripe\StripeAccountService;
use App\Services\Stripe\StripeCheckoutService;
use Mockery;
use Stripe\Checkout\Session;
use Stripe\Service\Checkout\SessionService;
use Stripe\Service\CheckoutServiceFactory;
use Stripe\StripeClient;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

class StripeCheckoutDiscountTest extends TestCase
{
    use CreatesStripeTestSchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpStripeSchema();
        config(['services.stripe.secret' => 'sk_test_fake_secret_for_tests']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    protected function makeUser(): User
    {
        return User::create([
            'name' => 'Buyer',
            'email' => 'buyer2@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'is_admin' => false,
            'is_active' => true,
            'is_guest' => false,
            'stripe_id' => 'cus_buyer2',
        ]);
    }

    protected function makePackage(array $overrides = []): Package
    {
        return Package::create(array_merge([
            'name' => 'Standard',
            'price_cents' => 1900,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_standard_monthly',
            'stripe_product_id' => 'prod_standard',
            'stripe_account_id' => 'acct_current',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
            'discount_enabled' => true,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'discount_duration' => 'once',
            'stripe_coupon_id' => 'coupon_pkg_20',
        ], $overrides));
    }

    protected function mockClientForCheckout(callable $assertParams): StripeClient
    {
        $sessions = Mockery::mock(SessionService::class);
        $sessions->shouldReceive('create')
            ->once()
            ->withArgs(function (array $params) use ($assertParams) {
                return $assertParams($params);
            })
            ->andReturn(Session::constructFrom([
                'id' => 'cs_test_1',
                'url' => 'https://checkout.stripe.com/c/pay/cs_test_1',
            ]));

        $checkoutFactory = Mockery::mock(CheckoutServiceFactory::class);
        $checkoutFactory->sessions = $sessions;

        $client = Mockery::mock(StripeClient::class);
        $client->checkout = $checkoutFactory;

        $customers = Mockery::mock();
        $customers->shouldReceive('retrieve')
            ->zeroOrMoreTimes()
            ->andReturn((object) ['id' => 'cus_buyer2']);
        $customers->shouldReceive('create')
            ->zeroOrMoreTimes()
            ->andReturn((object) ['id' => 'cus_buyer2']);
        $client->customers = $customers;

        $prices = Mockery::mock();
        $prices->shouldReceive('retrieve')->andReturn((object) [
            'id' => 'price_standard_monthly',
            'active' => true,
            'livemode' => false,
            'product' => (object) ['id' => 'prod_standard', 'active' => true],
        ]);
        $client->prices = $prices;

        return $client;
    }

    public function test_checkout_session_includes_package_coupon_and_display_price_metadata(): void
    {
        $user = $this->makeUser();
        $package = $this->makePackage();

        $accounts = Mockery::mock(StripeAccountService::class);
        $accounts->shouldReceive('currentAccountId')->andReturn('acct_current');
        $this->app->instance(StripeAccountService::class, $accounts);

        $client = $this->mockClientForCheckout(function (array $params) {
            return ($params['discounts'][0]['coupon'] ?? null) === 'coupon_pkg_20'
                && ($params['line_items'][0]['price'] ?? null) === 'price_standard_monthly'
                && ($params['metadata']['display_price_cents'] ?? null) === '1520'
                && ($params['metadata']['original_price_cents'] ?? null) === '1900'
                && ($params['metadata']['discount_applied'] ?? null) === 'true'
                && empty($params['allow_promotion_codes']);
        });

        $this->app->instance(StripeClient::class, $client);
        $this->app->instance(PackageDiscountService::class, new PackageDiscountService($client));

        $service = new StripeCheckoutService($client);
        $session = $service->createSubscriptionCheckoutSession($user, $package);

        $this->assertSame('cs_test_1', $session->id);
    }

    public function test_expired_discount_checkout_omits_coupon(): void
    {
        $user = $this->makeUser();
        $package = $this->makePackage([
            'discount_ends_at' => now()->subDay(),
        ]);

        $accounts = Mockery::mock(StripeAccountService::class);
        $accounts->shouldReceive('currentAccountId')->andReturn('acct_current');
        $this->app->instance(StripeAccountService::class, $accounts);

        $client = $this->mockClientForCheckout(function (array $params) {
            return empty($params['discounts'] ?? null)
                && ($params['metadata']['discount_applied'] ?? null) === 'false'
                && ($params['metadata']['display_price_cents'] ?? null) === '1900';
        });

        $this->app->instance(StripeClient::class, $client);
        $this->app->instance(PackageDiscountService::class, new PackageDiscountService($client));

        $service = new StripeCheckoutService($client);
        $session = $service->createSubscriptionCheckoutSession($user, $package->fresh());

        $this->assertSame('cs_test_1', $session->id);
    }
}
