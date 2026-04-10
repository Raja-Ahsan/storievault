<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Product;
use Stripe\Price;
use Exception;



class PackagesController extends Controller
{
    // auto generate packages in stripe 
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('admin/packages/Index', [
            'packages' => Package::paginate(10)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/packages/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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

        // Ensure features is always an array
        if (isset($data['features'])) {
            $data['features'] = is_array($data['features']) ? $data['features'] : [];
        } else {
            $data['features'] = [];
        }

        // Set default values
        $data['is_active'] = $data['is_active'] ?? true;

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            // ⚡ Create Stripe Product
            $product = Product::create([
                'name' => $data['name'],
                'description' => !empty($data['features'])
                    ? implode(', ', $data['features'])
                    : 'Subscription package for StoryVault.',
            ]);

            // ⚡ Create Stripe Price (if not free)
            if (!empty($data['price_cents']) && $data['price_cents'] > 0) {
                $interval = $data['interval'] ?? 'month';
                $price = Price::create([
                    'unit_amount' => $data['price_cents'],
                    'currency' => 'usd',
                    'recurring' => [
                        'interval' => $interval === 'yearly' ? 'year' : 'month',
                    ],
                    'product' => $product->id,
                ]);

                $data['stripe_price_id'] = $price->id;
            } else {
                // Free package (no price)
                $data['stripe_price_id'] = null;
            }

            // ⚡ Save locally
            Package::create($data);

            return redirect()
                ->route('admin-dashboard.packages.index')
                ->with('success', 'Package created successfully in Stripe and local database.');
        } catch (Exception $e) {
            return back()->with('error', 'Stripe error: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $package = Package::findOrFail($id);

        return Inertia::render('admin/packages/Show', [
            'package' => $package
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $package = Package::findOrFail($id);

        return Inertia::render('admin/packages/Edit', [
            'package' => $package
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Package $package)
    {
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

        // Ensure features is always an array
        if (isset($data['features'])) {
            $data['features'] = is_array($data['features']) ? $data['features'] : [];
        } else {
            $data['features'] = [];
        }

        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            // 🔍 Step 1: Find the product linked to this package
            if ($package->stripe_price_id) {
                $oldPrice = \Stripe\Price::retrieve($package->stripe_price_id);
                $productId = $oldPrice->product;

                \Stripe\Product::update($productId, [
                    'name' => $data['name'],
                    'description' => implode(', ', $data['features'] ?? []),
                ]);

                if ($data['price_cents'] != $package->price_cents || $data['interval'] != $package->interval) {
                    $interval = $data['interval'] ?? 'month';

                    $newPrice = \Stripe\Price::create([
                        'unit_amount' => $data['price_cents'],
                        'currency' => 'usd',
                        'recurring' => ['interval' => $interval === 'yearly' ? 'year' : 'month'],
                        'product' => $productId,
                    ]);

                    $data['stripe_price_id'] = $newPrice->id;
                }
            }

            // ⚡ Step 3: Update local DB
            $package->update($data);

            return back()->with('success', 'Package updated successfully in Stripe and local database.');
        } catch (\Exception $e) {
            return back()->with('error', 'Stripe update failed: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package)
    {
        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            // ✅ Step 1: Find linked Stripe Product
            if ($package->stripe_price_id) {
                $price = \Stripe\Price::retrieve($package->stripe_price_id);
                $productId = $price->product ?? null;

                if ($productId) {
                    // ⚡ Step 2: Archive (deactivate) the product in Stripe
                    \Stripe\Product::update($productId, [
                        'active' => false,
                    ]);
                }
            }

            // ✅ Step 3: Delete from local DB
            $package->delete();

            return back()->with('success', 'Package deleted locally and archived in Stripe.');
        } catch (\Exception $e) {
            return back()->with('error', 'Stripe deletion failed: ' . $e->getMessage());
        }
    }
}
