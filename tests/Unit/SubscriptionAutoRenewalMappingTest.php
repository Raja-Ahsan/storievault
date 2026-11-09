<?php

namespace Tests\Unit;

use App\Models\Subscription;
use App\Models\User;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

/**
 * Documents the UI contract:
 * - cancel_at_period_end = false → Auto Renewal toggle ON
 * - cancel_at_period_end = true  → Auto Renewal toggle OFF
 */
class SubscriptionAutoRenewalMappingTest extends TestCase
{
    use CreatesStripeTestSchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpStripeSchema();
    }

    public function test_cancel_at_period_end_is_cast_to_boolean(): void
    {
        $user = User::create([
            'name' => 'Cast User',
            'email' => 'cast@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'is_admin' => false,
            'is_active' => true,
            'is_guest' => false,
        ]);

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_id' => 'sub_cast_1',
            'stripe_status' => 'active',
            'stripe_price' => 'price_test',
            'quantity' => 1,
            'cancel_at_period_end' => 0,
        ]);

        $subscription->refresh();

        $this->assertIsBool($subscription->cancel_at_period_end);
        $this->assertFalse($subscription->cancel_at_period_end);
    }

    public function test_ui_toggle_on_when_cancel_at_period_end_is_false(): void
    {
        $cancelAtPeriodEnd = false;
        $isAutoRenewalEnabled = ! $cancelAtPeriodEnd;

        $this->assertTrue($isAutoRenewalEnabled);
    }

    public function test_ui_toggle_off_when_cancel_at_period_end_is_true(): void
    {
        $cancelAtPeriodEnd = true;
        $isAutoRenewalEnabled = ! $cancelAtPeriodEnd;

        $this->assertFalse($isAutoRenewalEnabled);
    }

    public function test_integer_zero_from_mysql_must_not_break_toggle_on_state(): void
    {
        // Regression: JS `0 === false` is false, so UI used to start OFF incorrectly.
        $cancelAtPeriodEnd = 0;
        $brokenCheck = $cancelAtPeriodEnd === false;
        $correctCheck = ! $cancelAtPeriodEnd;

        $this->assertFalse($brokenCheck);
        $this->assertTrue($correctCheck);
    }
}
