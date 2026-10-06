<?php

namespace Tests\Feature;

use App\Exceptions\CheckoutException;
use App\Models\Package;
use App\Models\User;
use App\Services\Stripe\StripeCheckoutService;
use Mockery;
use Stripe\Checkout\Session;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

class StripeCheckoutTest extends TestCase
{
    use CreatesStripeTestSchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpStripeSchema();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    protected function makePackage(array $overrides = []): Package
    {
        return Package::create(array_merge([
            'name' => 'Standard Package',
            'price_cents' => 1900,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_test_standard_monthly',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ], $overrides));
    }

    protected function mockCheckoutService(): Mockery\MockInterface
    {
        $mock = Mockery::mock(StripeCheckoutService::class);
        $this->app->instance(StripeCheckoutService::class, $mock);

        return $mock;
    }

    protected function expectCheckoutLock(Mockery\MockInterface $mock): void
    {
        $lock = Mockery::mock(\Illuminate\Contracts\Cache\Lock::class);
        $lock->shouldReceive('release')->zeroOrMoreTimes();
        $mock->shouldReceive('acquireCheckoutLock')->once()->andReturn($lock);
    }

    public function test_unauthenticated_checkout_is_rejected(): void
    {
        $package = $this->makePackage();

        $response = $this->postJson('/stripe/checkout', [
            'package_id' => $package->id,
            'mode' => 'subscription',
        ]);

        $response->assertUnauthorized();
    }

    public function test_invalid_package_returns_friendly_error(): void
    {
        $user = User::factory()->create();
        $mock = $this->mockCheckoutService();
        $this->expectCheckoutLock($mock);
        $mock->shouldReceive('resolveSubscriptionPackage')
            ->once()
            ->andThrow(new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                'missing package',
                404
            ));

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => 999999,
            'mode' => 'subscription',
        ]);

        $response->assertStatus(404);
        $response->assertJson([
            'error' => "We couldn't start checkout right now. Please try again.",
        ]);
        $this->assertStringNotContainsString('missing package', $response->getContent());
    }

    public function test_successful_checkout_creation(): void
    {
        $user = User::factory()->create();
        $package = $this->makePackage();

        $session = Session::constructFrom(['id' => 'cs_test_123']);

        $mock = $this->mockCheckoutService();
        $this->expectCheckoutLock($mock);
        $mock->shouldReceive('resolveSubscriptionPackage')->once()->andReturn($package);
        $mock->shouldReceive('userHasActiveSubscription')->once()->andReturn(false);
        $mock->shouldReceive('createSubscriptionCheckoutSession')
            ->once()
            ->with(Mockery::on(fn ($u) => $u->id === $user->id), Mockery::on(fn ($p) => $p->id === $package->id))
            ->andReturn($session);

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => $package->id,
            'mode' => 'subscription',
            'amount' => 1,
            'stripe_price_id' => 'price_client_forged',
        ]);

        $response->assertOk()->assertJson(['id' => 'cs_test_123']);
    }

    public function test_stripe_api_failure_returns_friendly_error_without_internals(): void
    {
        $user = User::factory()->create();
        $package = $this->makePackage();

        $mock = $this->mockCheckoutService();
        $this->expectCheckoutLock($mock);
        $mock->shouldReceive('resolveSubscriptionPackage')->once()->andReturn($package);
        $mock->shouldReceive('userHasActiveSubscription')->once()->andReturn(false);
        $mock->shouldReceive('createSubscriptionCheckoutSession')
            ->once()
            ->andThrow(new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                'Price `price_x` is not available because its product is not active',
                502
            ));

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => $package->id,
        ]);

        $response->assertStatus(502);
        $response->assertJson([
            'error' => "We couldn't start checkout right now. Please try again.",
        ]);
        $this->assertStringNotContainsString('product is not active', $response->getContent());
        $this->assertStringNotContainsString('price_x', $response->getContent());
    }

    public function test_duplicate_checkout_request_is_blocked(): void
    {
        $user = User::factory()->create();

        $mock = $this->mockCheckoutService();
        $mock->shouldReceive('acquireCheckoutLock')
            ->once()
            ->andThrow(new CheckoutException(
                'Checkout is already in progress. Please wait a moment.',
                'lock held',
                429
            ));

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => 1,
        ]);

        $response->assertStatus(429);
        $response->assertJson([
            'error' => 'Checkout is already in progress. Please wait a moment.',
        ]);
    }

    public function test_already_active_subscription_is_rejected(): void
    {
        $user = User::factory()->create();
        $package = $this->makePackage();

        $mock = $this->mockCheckoutService();
        $this->expectCheckoutLock($mock);
        $mock->shouldReceive('resolveSubscriptionPackage')->once()->andReturn($package);
        $mock->shouldReceive('userHasActiveSubscription')->once()->andReturn(true);

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => $package->id,
        ]);

        $response->assertStatus(409);
        $response->assertJson([
            'error' => 'You already have an active subscription.',
        ]);
    }

    public function test_unexpected_exception_does_not_leak_details(): void
    {
        $user = User::factory()->create();

        $mock = $this->mockCheckoutService();
        $mock->shouldReceive('acquireCheckoutLock')
            ->once()
            ->andThrow(new \RuntimeException('SQLSTATE[HY000] secret DB boom'));

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => 1,
        ]);

        $response->assertStatus(500);
        $response->assertJson([
            'error' => "We couldn't start checkout right now. Please try again.",
        ]);
        $this->assertStringNotContainsString('SQLSTATE', $response->getContent());
        $this->assertStringNotContainsString('secret DB boom', $response->getContent());
    }

    public function test_test_live_price_mismatch_protection(): void
    {
        $user = User::factory()->create();
        $package = $this->makePackage();

        $mock = $this->mockCheckoutService();
        $this->expectCheckoutLock($mock);
        $mock->shouldReceive('resolveSubscriptionPackage')->once()->andReturn($package);
        $mock->shouldReceive('userHasActiveSubscription')->once()->andReturn(false);
        $mock->shouldReceive('createSubscriptionCheckoutSession')
            ->once()
            ->andThrow(new CheckoutException(
                "We couldn't start checkout right now. Please try again.",
                'Test/live Price ID mismatch: test keys used with live price price_live_abc',
                422
            ));

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => $package->id,
        ]);

        $response->assertStatus(422);
        $this->assertStringNotContainsString('price_live_abc', $response->getContent());
        $this->assertStringNotContainsString('mismatch', $response->getContent());
    }

    public function test_free_package_activates_without_stripe_session(): void
    {
        $user = User::factory()->create();
        $package = $this->makePackage([
            'name' => 'Free',
            'price_cents' => 0,
            'stripe_price_id' => null,
            'is_public' => false,
        ]);

        $mock = $this->mockCheckoutService();
        $this->expectCheckoutLock($mock);
        $mock->shouldReceive('resolveSubscriptionPackage')->once()->andReturn($package);
        $mock->shouldReceive('userHasActiveSubscription')->once()->andReturn(false);

        $response = $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => $package->id,
        ]);

        $response->assertOk()->assertJsonStructure(['free', 'redirect']);
        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'stripe_status' => 'active',
            'type' => 'free',
        ]);
    }

    public function test_client_cannot_force_custom_amount_or_price(): void
    {
        $user = User::factory()->create();
        $package = $this->makePackage(['stripe_price_id' => 'price_authoritative']);

        $session = Session::constructFrom(['id' => 'cs_test_auth']);

        $mock = $this->mockCheckoutService();
        $this->expectCheckoutLock($mock);
        $mock->shouldReceive('resolveSubscriptionPackage')
            ->once()
            ->with($package->id)
            ->andReturn($package);
        $mock->shouldReceive('userHasActiveSubscription')->once()->andReturn(false);
        $mock->shouldReceive('createSubscriptionCheckoutSession')
            ->once()
            ->withArgs(function ($u, $p) use ($package) {
                return $p->stripe_price_id === 'price_authoritative'
                    && $p->id === $package->id;
            })
            ->andReturn($session);

        $this->actingAs($user)->postJson('/stripe/checkout', [
            'package_id' => $package->id,
            'stripe_price_id' => 'price_forged_by_client',
            'amount' => 100,
        ])->assertOk()->assertJson(['id' => 'cs_test_auth']);
    }
}
