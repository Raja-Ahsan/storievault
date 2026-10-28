<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Services\Stripe\PackageCatalogService;
use App\Services\Stripe\StripeAccountService;
use App\Services\Stripe\StripeCheckoutService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Price;
use Stripe\Product;
use Stripe\Stripe;

class PackagesController extends Controller
{
    public function index(PackageCatalogService $catalog)
    {
        return Inertia::render('admin/packages/Index', [
            'packages' => $catalog->adminPackagesForCurrentAccount(10),
            'stripe_account_id' => $catalog->currentStripeAccountId(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/packages/Create');
    }

    public function store(Request $request, StripeAccountService $accounts)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'badge' => 'nullable|string',
            'price_cents' => 'nullable|integer|min:0',
            'words_limit' => 'nullable|integer|min:0',
            'stories_limit' => 'nullable|integer|min:0',
            'interval' => 'nullable|string|in:monthly,yearly',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $data['features'] = isset($data['features']) && is_array($data['features'])
            ? $data['features']
            : [];
        $data['is_active'] = $data['is_active'] ?? true;

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $accountId = $accounts->currentAccountId();
            if (! $accountId) {
                return back()->withErrors([
                    'stripe' => 'Could not verify the current Stripe account. Please check your Stripe keys and try again.',
                ]);
            }

            $product = Product::create([
                'name' => $data['name'],
                'description' => ! empty($data['features'])
                    ? implode(', ', $data['features'])
                    : 'Subscription package for StoryVault.',
                'metadata' => [
                    'stripe_account_id' => $accountId,
                ],
            ]);

            $interval = $data['interval'] ?? 'month';
            $price = Price::create([
                'unit_amount' => (int) ($data['price_cents'] ?? 0),
                'currency' => 'usd',
                'recurring' => [
                    'interval' => $interval === 'yearly' ? 'year' : 'month',
                ],
                'product' => $product->id,
            ]);

            $data['stripe_price_id'] = $price->id;
            $data['stripe_product_id'] = $product->id;
            $data['stripe_account_id'] = $accountId;

            $package = Package::create($data);

            if (! empty($package->stripe_price_id)) {
                app(StripeCheckoutService::class)->forgetPriceAvailabilityCache($package->stripe_price_id);
            }

            return redirect()
                ->route('admin-dashboard.packages.index')
                ->with('success', 'Package created successfully in Stripe and local database.');
        } catch (Exception $e) {
            Log::error('Admin package create failed', [
                'message' => $e->getMessage(),
                'name' => $data['name'] ?? null,
            ]);

            return back()->withErrors([
                'stripe' => 'Could not create the package with Stripe. Please check your Stripe keys and try again.',
            ]);
        }
    }

    public function show(string $id, PackageCatalogService $catalog)
    {
        $package = Package::findOrFail($id);
        $this->ensureCurrentAccountPackage($package, $catalog);

        return Inertia::render('admin/packages/Show', [
            'package' => $package,
        ]);
    }

    public function edit(string $id, PackageCatalogService $catalog)
    {
        $package = Package::findOrFail($id);
        $this->ensureCurrentAccountPackage($package, $catalog);

        return Inertia::render('admin/packages/Edit', [
            'package' => $package,
        ]);
    }

    public function update(Request $request, Package $package, PackageCatalogService $catalog, StripeAccountService $accounts)
    {
        $this->ensureCurrentAccountPackage($package, $catalog);

        $data = $request->validate([
            'name' => 'required|string',
            'badge' => 'nullable|string',
            'price_cents' => 'nullable|integer|min:0',
            'interval' => 'nullable|string',
            'words_limit' => 'nullable|integer',
            'stories_limit' => 'nullable|integer',
            'features' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $data['features'] = isset($data['features']) && is_array($data['features'])
            ? $data['features']
            : [];

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $accountId = $accounts->currentAccountId();
            if (! $accountId) {
                return back()->withErrors([
                    'stripe' => 'Could not verify the current Stripe account. Please check your Stripe keys and try again.',
                ]);
            }

            $productId = $package->stripe_product_id;

            if (! $productId && $package->stripe_price_id) {
                $oldPrice = Price::retrieve($package->stripe_price_id);
                $productId = is_object($oldPrice->product) ? $oldPrice->product->id : $oldPrice->product;
            }

            if ($productId) {
                Product::update($productId, [
                    'name' => $data['name'],
                    'description' => implode(', ', $data['features'] ?? []),
                ]);

                if ((int) ($data['price_cents'] ?? 0) !== (int) $package->price_cents
                    || ($data['interval'] ?? null) !== $package->interval) {
                    $interval = $data['interval'] ?? 'month';

                    $newPrice = Price::create([
                        'unit_amount' => (int) ($data['price_cents'] ?? 0),
                        'currency' => 'usd',
                        'recurring' => ['interval' => $interval === 'yearly' ? 'year' : 'month'],
                        'product' => $productId,
                    ]);

                    $data['stripe_price_id'] = $newPrice->id;
                }

                $data['stripe_product_id'] = $productId;
            }

            $data['stripe_account_id'] = $accountId;
            $package->update($data);

            if (! empty($package->stripe_price_id)) {
                app(StripeCheckoutService::class)->forgetPriceAvailabilityCache($package->stripe_price_id);
            }

            return back()->with('success', 'Package updated successfully in Stripe and local database.');
        } catch (\Exception $e) {
            Log::error('Admin package update failed', [
                'package_id' => $package->id,
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'stripe' => 'Could not update the package with Stripe. Please try again.',
            ]);
        }
    }

    public function destroy(Package $package, PackageCatalogService $catalog)
    {
        $this->ensureCurrentAccountPackage($package, $catalog);

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $productId = $package->stripe_product_id;

            if (! $productId && $package->stripe_price_id) {
                $price = Price::retrieve($package->stripe_price_id);
                $productId = is_object($price->product) ? $price->product->id : ($price->product ?? null);
            }

            if ($productId) {
                Product::update($productId, ['active' => false]);
            }

            $package->delete();

            return back()->with('success', 'Package deleted locally and archived in Stripe.');
        } catch (\Exception $e) {
            Log::error('Admin package delete failed', [
                'package_id' => $package->id,
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'stripe' => 'Could not delete the package in Stripe. Please try again.',
            ]);
        }
    }

    protected function ensureCurrentAccountPackage(Package $package, PackageCatalogService $catalog): void
    {
        if (! $catalog->belongsToCurrentAccount($package)) {
            abort(404);
        }
    }
}
