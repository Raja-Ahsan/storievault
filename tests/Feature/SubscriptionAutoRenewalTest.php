<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Mockery;
use Stripe\Service\SubscriptionService;
use Stripe\StripeClient;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

class SubscriptionAutoRenewalTest extends TestCase
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

    protected function makeUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'is_admin' => false,
            'is_active' => true,
            'is_guest' => false,
        ], $overrides));
    }

    protected function makeSubscription(User $user, array $overrides = []): Subscription
    {
        return Subscription::create(array_merge([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_id' => 'sub_test_123',
            'stripe_status' => 'active',
            'stripe_price' => 'price_test_standard',
            'quantity' => 1,
            'cancel_at_period_end' => false,
        ], $overrides));
    }

    /**
     * @param  object{status:string,cancel_at_period_end:bool,cancel_at:?int}  $current
     * @param  object{status:string,cancel_at_period_end:bool,cancel_at:?int}  $updated
     */
    protected function mockStripeToggle(object $current, object $updated, string $stripeId = 'sub_test_123'): void
    {
        $expectedCancelAtPeriodEnd = ! $current->cancel_at_period_end;

        $subscriptionService = Mockery::mock(SubscriptionService::class);
        $subscriptionService->shouldReceive('retrieve')
            ->once()
            ->with($stripeId)
            ->andReturn($current);

        $subscriptionService->shouldReceive('update')
            ->once()
            ->with($stripeId, ['cancel_at_period_end' => $expectedCancelAtPeriodEnd])
            ->andReturn($updated);

        $client = Mockery::mock(StripeClient::class);
        $client->subscriptions = $subscriptionService;

        $this->app->instance(StripeClient::class, $client);
    }

    public function test_guest_cannot_toggle_auto_renewal(): void
    {
        $user = $this->makeUser();
        $subscription = $this->makeSubscription($user);

        $this->postJson("/subscription/{$subscription->id}/toggle-renewal")
            ->assertUnauthorized();
    }

    public function test_user_cannot_toggle_another_users_subscription(): void
    {
        $owner = $this->makeUser(['email' => 'owner@example.com']);
        $other = $this->makeUser(['email' => 'other@example.com']);
        $subscription = $this->makeSubscription($owner);

        $this->actingAs($other)
            ->postJson("/subscription/{$subscription->id}/toggle-renewal")
            ->assertForbidden()
            ->assertJson([
                'error' => 'Unauthorized. You can only toggle your own subscription.',
            ]);
    }

    public function test_turning_toggle_off_disables_auto_renewal(): void
    {
        $user = $this->makeUser();
        $subscription = $this->makeSubscription($user, [
            'cancel_at_period_end' => false, // currently renewing
        ]);

        $periodEnd = now()->addMonth()->timestamp;

        $this->mockStripeToggle(
            (object) [
                'status' => 'active',
                'cancel_at_period_end' => false,
                'cancel_at' => null,
            ],
            (object) [
                'status' => 'active',
                'cancel_at_period_end' => true,
                'cancel_at' => $periodEnd,
            ],
        );

        $response = $this->actingAs($user)
            ->postJson("/subscription/{$subscription->id}/toggle-renewal");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'auto_renewal' => false,
                'cancel_at_period_end' => true,
                'message' => 'Auto-renewal disabled, subscription will end at period end.',
            ]);

        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
            'cancel_at_period_end' => 1,
        ]);

        $subscription->refresh();
        $this->assertTrue($subscription->cancel_at_period_end);
        $this->assertFalse(! $subscription->cancel_at_period_end); // UI toggle should be OFF
    }

    public function test_turning_toggle_on_enables_auto_renewal(): void
    {
        $user = $this->makeUser();
        $subscription = $this->makeSubscription($user, [
            'cancel_at_period_end' => true, // currently set to cancel
            'ends_at' => now()->addMonth(),
        ]);

        $this->mockStripeToggle(
            (object) [
                'status' => 'active',
                'cancel_at_period_end' => true,
                'cancel_at' => now()->addMonth()->timestamp,
            ],
            (object) [
                'status' => 'active',
                'cancel_at_period_end' => false,
                'cancel_at' => null,
            ],
        );

        $response = $this->actingAs($user)
            ->postJson("/subscription/{$subscription->id}/toggle-renewal");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'auto_renewal' => true,
                'cancel_at_period_end' => false,
                'message' => 'Auto-renewal enabled, subscription will continue.',
            ]);

        $subscription->refresh();
        $this->assertFalse($subscription->cancel_at_period_end);
        $this->assertTrue(! $subscription->cancel_at_period_end); // UI toggle should be ON
        $this->assertNull($subscription->ends_at);
    }

    public function test_auto_renewal_flag_is_inverse_of_cancel_at_period_end(): void
    {
        $user = $this->makeUser();
        $subscription = $this->makeSubscription($user, [
            'cancel_at_period_end' => false,
        ]);

        $this->mockStripeToggle(
            (object) [
                'status' => 'active',
                'cancel_at_period_end' => false,
                'cancel_at' => null,
            ],
            (object) [
                'status' => 'active',
                'cancel_at_period_end' => true,
                'cancel_at' => now()->addDays(10)->timestamp,
            ],
        );

        $payload = $this->actingAs($user)
            ->postJson("/subscription/{$subscription->id}/toggle-renewal")
            ->assertOk()
            ->json();

        $this->assertSame(
            ! $payload['cancel_at_period_end'],
            $payload['auto_renewal'],
            'auto_renewal must always be the inverse of cancel_at_period_end'
        );
    }

    public function test_canceled_stripe_subscription_cannot_toggle_renewal(): void
    {
        $user = $this->makeUser();
        $subscription = $this->makeSubscription($user, [
            'stripe_status' => 'canceled',
            'cancel_at_period_end' => true,
        ]);

        $subscriptionService = Mockery::mock(SubscriptionService::class);
        $subscriptionService->shouldReceive('retrieve')
            ->once()
            ->with('sub_test_123')
            ->andReturn((object) [
                'status' => 'canceled',
                'cancel_at_period_end' => true,
                'cancel_at' => null,
            ]);
        $subscriptionService->shouldNotReceive('update');

        $client = Mockery::mock(StripeClient::class);
        $client->subscriptions = $subscriptionService;
        $this->app->instance(StripeClient::class, $client);

        $this->actingAs($user)
            ->postJson("/subscription/{$subscription->id}/toggle-renewal")
            ->assertStatus(400)
            ->assertJsonFragment([
                'error' => 'Cannot toggle renewal for a canceled subscription. Please create a new subscription.',
            ]);
    }

    public function test_admin_can_toggle_another_users_subscription(): void
    {
        $owner = $this->makeUser(['email' => 'owner@example.com']);
        $admin = $this->makeUser([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_admin' => true,
        ]);
        $subscription = $this->makeSubscription($owner, [
            'cancel_at_period_end' => true,
        ]);

        $this->mockStripeToggle(
            (object) [
                'status' => 'active',
                'cancel_at_period_end' => true,
                'cancel_at' => now()->addMonth()->timestamp,
            ],
            (object) [
                'status' => 'active',
                'cancel_at_period_end' => false,
                'cancel_at' => null,
            ],
        );

        $this->actingAs($admin)
            ->postJson("/subscription/{$subscription->id}/toggle-renewal")
            ->assertOk()
            ->assertJson([
                'success' => true,
                'auto_renewal' => true,
                'cancel_at_period_end' => false,
            ]);
    }
}
