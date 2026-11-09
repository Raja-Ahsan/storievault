<?php

namespace Tests\Unit;

use App\Models\Package;
use Carbon\Carbon;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

class PackageDiscountTest extends TestCase
{
    use CreatesStripeTestSchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpStripeSchema();
    }

    protected function makePackage(array $overrides = []): Package
    {
        return Package::create(array_merge([
            'name' => 'Standard',
            'price_cents' => 1900,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_test_1',
            'stripe_product_id' => 'prod_test_1',
            'stripe_account_id' => 'acct_test',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
            'discount_enabled' => false,
        ], $overrides));
    }

    public function test_percentage_discount_calculates_display_price(): void
    {
        $package = $this->makePackage([
            'discount_enabled' => true,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'discount_duration' => 'once',
        ]);

        $this->assertTrue($package->discount_active);
        $this->assertSame(1520, $package->display_price_cents);
        $this->assertSame('20% OFF', $package->discount_badge);
        $this->assertStringContainsString('First billing only', (string) $package->renewal_note);
    }

    public function test_fixed_discount_calculates_display_price(): void
    {
        $package = $this->makePackage([
            'discount_enabled' => true,
            'discount_type' => 'fixed',
            'discount_value' => 400,
            'discount_duration' => 'forever',
        ]);

        $this->assertSame(1500, $package->display_price_cents);
        $this->assertSame('$4.00 OFF', $package->discount_badge);
    }

    public function test_expired_discount_is_inactive(): void
    {
        Carbon::setTestNow('2026-11-09 12:00:00');

        $package = $this->makePackage([
            'discount_enabled' => true,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'discount_duration' => 'once',
            'discount_ends_at' => '2026-11-01 00:00:00',
        ]);

        $this->assertFalse($package->discount_active);
        $this->assertSame(1900, $package->display_price_cents);
        $this->assertFalse($package->shouldApplyDiscountAtCheckout());

        Carbon::setTestNow();
    }

    public function test_future_discount_is_inactive_until_start(): void
    {
        Carbon::setTestNow('2026-11-09 12:00:00');

        $package = $this->makePackage([
            'discount_enabled' => true,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'discount_duration' => 'once',
            'discount_starts_at' => '2026-12-01 00:00:00',
            'stripe_coupon_id' => 'coupon_future',
        ]);

        $this->assertFalse($package->hasActiveDiscountWindow());
        $this->assertFalse($package->shouldApplyDiscountAtCheckout());

        Carbon::setTestNow();
    }

    public function test_disabled_discount_restores_original_price(): void
    {
        $package = $this->makePackage([
            'discount_enabled' => false,
            'discount_type' => 'percentage',
            'discount_value' => 50,
            'discount_duration' => 'forever',
            'stripe_coupon_id' => 'coupon_old',
        ]);

        $this->assertFalse($package->discount_active);
        $this->assertSame(1900, $package->display_price_cents);
        $this->assertFalse($package->shouldApplyDiscountAtCheckout());
    }

    public function test_checkout_requires_coupon_id_and_active_window(): void
    {
        $package = $this->makePackage([
            'discount_enabled' => true,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'discount_duration' => 'once',
            'stripe_coupon_id' => 'coupon_abc',
        ]);

        $this->assertTrue($package->shouldApplyDiscountAtCheckout());

        $package->stripe_coupon_id = null;
        $this->assertFalse($package->shouldApplyDiscountAtCheckout());
    }
}
