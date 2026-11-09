<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\User;
use App\Services\Stripe\PackageCatalogService;
use App\Services\Stripe\StripeCheckoutService;
use Mockery;
use Stripe\Checkout\Session;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

class PackageDiscountCheckoutTest extends TestCase
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

    public function test_checkout_endpoint_uses_discounted_package_without_client_price_override(): void
    {
        $user = User::create([
            'name' => 'Buyer',
            'email' => 'buyer-feature@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'is_admin' => false,
            'is_active' => true,
            'is_guest' => false,
        ]);

        $package = Package::create([
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
        ]);

        $this->assertSame(1520, $package->display_price_cents);

        $session = Session::constructFrom([
            'id' => 'cs_test_feature',
            'url' => 'https://checkout.stripe.com/c/pay/cs_test_feature',
        ]);

        $checkout = Mockery::mock(StripeCheckoutService::class);
        $lock = Mockery::mock(\Illuminate\Contracts\Cache\Lock::class);
        $lock->shouldReceive('release')->zeroOrMoreTimes();
        $checkout->shouldReceive('acquireCheckoutLock')->once()->andReturn($lock);
        $checkout->shouldReceive('resolveSubscriptionPackage')->once()->andReturn($package);
        $checkout->shouldReceive('userHasActiveSubscription')->once()->andReturn(false);
        $checkout->shouldReceive('createSubscriptionCheckoutSession')
            ->once()
            ->with(
                Mockery::on(fn ($u) => $u->id === $user->id),
                Mockery::on(fn (Package $p) => $p->id === $package->id
                    && $p->shouldApplyDiscountAtCheckout()
                    && $p->display_price_cents === 1520)
            )
            ->andReturn($session);
        $this->app->instance(StripeCheckoutService::class, $checkout);

        $catalog = Mockery::mock(PackageCatalogService::class);
        $catalog->shouldReceive('belongsToCurrentAccount')->andReturn(true);
        $this->app->instance(PackageCatalogService::class, $catalog);

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => $package->id,
            'mode' => 'subscription',
            // Client must never control discount/price:
            'amount' => 1,
            'discount_code' => 'HACK',
        ]);

        $response->assertOk()->assertJson([
            'id' => 'cs_test_feature',
            'url' => 'https://checkout.stripe.com/c/pay/cs_test_feature',
        ]);
    }
}
