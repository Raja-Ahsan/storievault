<?php

namespace Tests\Unit;

use App\Models\Package;
use App\Services\Stripe\PackageDiscountService;
use Mockery;
use Stripe\Service\CouponService;
use Stripe\StripeClient;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

class PackageDiscountServiceTest extends TestCase
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
            'name' => 'Premium',
            'price_cents' => 3800,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_prem',
            'stripe_product_id' => 'prod_prem',
            'stripe_account_id' => 'acct_test',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
            'discount_enabled' => true,
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'discount_duration' => 'once',
        ], $overrides));
    }

    public function test_sync_creates_stripe_coupon_for_active_discount(): void
    {
        $package = $this->makePackage();

        $coupons = Mockery::mock(CouponService::class);
        $coupons->shouldReceive('create')
            ->once()
            ->withArgs(function (array $params) use ($package) {
                return ($params['percent_off'] ?? null) == 20
                    && ($params['duration'] ?? null) === 'once'
                    && ($params['applies_to']['products'][0] ?? null) === 'prod_prem'
                    && ($params['metadata']['package_id'] ?? null) === (string) $package->id;
            })
            ->andReturn((object) ['id' => 'coupon_new_1']);

        $client = Mockery::mock(StripeClient::class);
        $client->coupons = $coupons;

        $service = new PackageDiscountService($client);
        $synced = $service->sync($package);

        $this->assertSame('coupon_new_1', $synced->stripe_coupon_id);
        $this->assertSame('coupon_new_1', $service->checkoutCouponId($synced));
    }

    public function test_sync_deactivates_coupon_when_discount_disabled(): void
    {
        $package = $this->makePackage([
            'discount_enabled' => false,
            'stripe_coupon_id' => 'coupon_old',
        ]);

        $coupons = Mockery::mock(CouponService::class);
        $coupons->shouldReceive('delete')->once()->with('coupon_old')->andReturn((object) ['id' => 'coupon_old']);

        $client = Mockery::mock(StripeClient::class);
        $client->coupons = $coupons;

        $service = new PackageDiscountService($client);
        $synced = $service->sync($package);

        $this->assertNull($synced->stripe_coupon_id);
        $this->assertNull($service->checkoutCouponId($synced));
    }

    public function test_identical_coupon_is_not_recreated(): void
    {
        $package = $this->makePackage([
            'stripe_coupon_id' => 'coupon_existing',
        ]);

        $realService = new PackageDiscountService(Mockery::mock(StripeClient::class));
        $fpMethod = new \ReflectionMethod(PackageDiscountService::class, 'fingerprint');
        $fpMethod->setAccessible(true);
        $fp = $fpMethod->invoke($realService, $package);

        $coupons = Mockery::mock(CouponService::class);
        $coupons->shouldReceive('retrieve')
            ->once()
            ->with('coupon_existing')
            ->andReturn((object) [
                'id' => 'coupon_existing',
                'valid' => true,
                'metadata' => ['discount_fingerprint' => $fp],
            ]);
        $coupons->shouldNotReceive('create');
        $coupons->shouldNotReceive('delete');

        $client = Mockery::mock(StripeClient::class);
        $client->coupons = $coupons;

        $service = new PackageDiscountService($client);
        $synced = $service->sync($package);

        $this->assertSame('coupon_existing', $synced->stripe_coupon_id);
    }
}
