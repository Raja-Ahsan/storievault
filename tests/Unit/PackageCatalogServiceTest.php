<?php

namespace Tests\Unit;

use App\Models\Package;
use App\Services\Stripe\PackageCatalogService;
use App\Services\Stripe\StripeAccountService;
use App\Services\Stripe\StripeCheckoutService;
use Mockery;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

class PackageCatalogServiceTest extends TestCase
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

    protected function makeCatalog(
        ?StripeCheckoutService $checkout = null,
        ?string $accountId = 'acct_current',
    ): PackageCatalogService {
        $checkout = $checkout ?? Mockery::mock(StripeCheckoutService::class);
        $accounts = Mockery::mock(StripeAccountService::class);
        $accounts->shouldReceive('currentAccountId')->andReturn($accountId);

        return new PackageCatalogService($checkout, $accounts);
    }

    public function test_public_catalog_only_lists_packages_for_current_stripe_account(): void
    {
        $valid = Package::create([
            'name' => 'Valid Package',
            'price_cents' => 399,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_belongs_here',
            'stripe_account_id' => 'acct_current',
            'stripe_product_id' => 'prod_current',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ]);

        Package::create([
            'name' => 'Foreign Package',
            'price_cents' => 3800,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_other_account',
            'stripe_account_id' => 'acct_other',
            'stripe_product_id' => 'prod_other',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ]);

        $checkout = Mockery::mock(StripeCheckoutService::class);
        $checkout->shouldReceive('isPriceAvailableForCurrentAccount')
            ->with('price_belongs_here')
            ->once()
            ->andReturn(true);

        $catalog = $this->makeCatalog($checkout);
        $listed = $catalog->publiclyPurchasable();

        $this->assertCount(1, $listed);
        $this->assertSame($valid->id, $listed->first()->id);
    }

    public function test_switching_stripe_account_hides_previous_account_packages(): void
    {
        Package::create([
            'name' => 'Account A',
            'price_cents' => 999,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_a',
            'stripe_account_id' => 'acct_a',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ]);

        $b = Package::create([
            'name' => 'Account B',
            'price_cents' => 1999,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_b',
            'stripe_account_id' => 'acct_b',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ]);

        $checkout = Mockery::mock(StripeCheckoutService::class);
        $checkout->shouldReceive('isPriceAvailableForCurrentAccount')
            ->with('price_b')
            ->once()
            ->andReturn(true);

        $catalog = $this->makeCatalog($checkout, 'acct_b');
        $listed = $catalog->publiclyPurchasable();

        $this->assertCount(1, $listed);
        $this->assertSame($b->id, $listed->first()->id);
        $this->assertSame(2, Package::count());
    }

    public function test_admin_listing_is_empty_when_no_packages_for_current_account(): void
    {
        Package::create([
            'name' => 'Other',
            'price_cents' => 500,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_other',
            'stripe_account_id' => 'acct_other',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ]);

        $checkout = Mockery::mock(StripeCheckoutService::class);
        $catalog = $this->makeCatalog($checkout, 'acct_current');
        $page = $catalog->adminPackagesForCurrentAccount(10);

        $this->assertSame(0, $page->total());
        $this->assertSame(1, Package::count());
    }

    public function test_paid_package_without_price_id_is_not_publicly_listed(): void
    {
        Package::create([
            'name' => 'Broken Paid',
            'price_cents' => 1999,
            'interval' => 'monthly',
            'stripe_price_id' => null,
            'stripe_account_id' => 'acct_current',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ]);

        $checkout = Mockery::mock(StripeCheckoutService::class);
        $checkout->shouldReceive('isPriceAvailableForCurrentAccount')->never();

        $catalog = $this->makeCatalog($checkout);

        $this->assertCount(0, $catalog->publiclyPurchasable());
    }

    public function test_is_purchasable_true_for_free_packages_on_current_account(): void
    {
        $free = Package::create([
            'name' => 'Free',
            'price_cents' => 0,
            'interval' => 'monthly',
            'stripe_price_id' => null,
            'stripe_account_id' => 'acct_current',
            'is_active' => true,
            'is_public' => false,
            'features' => [],
        ]);

        $checkout = Mockery::mock(StripeCheckoutService::class);
        $checkout->shouldReceive('isPriceAvailableForCurrentAccount')->never();

        $catalog = $this->makeCatalog($checkout);

        $this->assertTrue($catalog->isPurchasableWithCurrentStripe($free));
    }

    public function test_foreign_account_package_is_not_purchasable(): void
    {
        $foreign = Package::create([
            'name' => 'Foreign',
            'price_cents' => 999,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_foreign',
            'stripe_account_id' => 'acct_other',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ]);

        $checkout = Mockery::mock(StripeCheckoutService::class);
        $catalog = $this->makeCatalog($checkout);

        $this->assertFalse($catalog->isPurchasableWithCurrentStripe($foreign));
        $this->assertFalse($catalog->belongsToCurrentAccount($foreign));
    }

    public function test_empty_catalog_when_stripe_account_cannot_be_resolved(): void
    {
        Package::create([
            'name' => 'Any',
            'price_cents' => 999,
            'interval' => 'monthly',
            'stripe_price_id' => 'price_any',
            'stripe_account_id' => 'acct_current',
            'is_active' => true,
            'is_public' => true,
            'features' => [],
        ]);

        $checkout = Mockery::mock(StripeCheckoutService::class);
        $catalog = $this->makeCatalog($checkout, null);

        $this->assertCount(0, $catalog->publiclyPurchasable());
        $this->assertSame(0, $catalog->adminPackagesForCurrentAccount()->total());
    }
}
