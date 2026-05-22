<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PublishPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;
<<<<<<< HEAD

class PublishPackageController extends Controller
{
    public function index() {
        $publishPackages = PublishPackage::paginate(10);
        
=======
use Stripe\Stripe;
use Stripe\Product;
use Stripe\Price;
use Exception;

class PublishPackageController extends Controller
{
    public function index()
    {
        $publishPackages = PublishPackage::paginate(10);

>>>>>>> live-main
        return Inertia::render('admin/publish-packages/Index', [
            'publishPackages' => $publishPackages,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

<<<<<<< HEAD
    public function create() {
        return Inertia::render('admin/publish-packages/Create');
    }

    public function store(Request $request) {
=======
    public function create()
    {
        return Inertia::render('admin/publish-packages/Create');
    }

    public function store(Request $request)
    {
>>>>>>> live-main
        $data = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric|decimal:2|min:0',
            'features' => 'nullable|array',
<<<<<<< HEAD
            'stripe_price_id' => 'required|string',
=======
>>>>>>> live-main
            'is_active' => 'boolean',
        ]);

        if (isset($data['features'])) {
            $data['features'] = is_array($data['features']) ? $data['features'] : [];
        } else {
            $data['features'] = [];
        }

        $data['is_active'] = $data['is_active'] ?? true;

<<<<<<< HEAD
        PublishPackage::create($data);
        return redirect()->route('admin-dashboard.publish-packages.index')
            ->with('success', 'Publish Package created successfully.');
    }

    public function show(PublishPackage $publishPackage) {
=======
        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            // ⚡ Step 1: Create Stripe Product
            $product = Product::create([
                'name' => $data['name'],
                'description' => !empty($data['features'])
                    ? implode(', ', $data['features'])
                    : 'Story publication package for StoryVault.',
            ]);

            // ⚡ Step 2: Create Stripe Price (one-time payment)
            $price = Price::create([
                'unit_amount' => intval($data['price'] * 100), // convert dollars → cents
                'currency' => 'usd',
                'product' => $product->id,
            ]);

            // Save price id
            $data['stripe_price_id'] = $price->id;

            // ⚡ Step 3: Save in local DB
            PublishPackage::create($data);

            return redirect()
                ->route('admin-dashboard.publish-packages.index')
                ->with('success', 'Publish Package created successfully in Stripe and local database.');
        } catch (Exception $e) {
            return back()->with('error', 'Stripe error: ' . $e->getMessage());
        }
    }

    public function show(PublishPackage $publishPackage)
    {
>>>>>>> live-main
        return Inertia::render('admin/publish-packages/Show', [
            'publishPackage' => $publishPackage,
        ]);
    }

<<<<<<< HEAD
    public function edit(PublishPackage $publishPackage) {
=======
    public function edit(PublishPackage $publishPackage)
    {
>>>>>>> live-main
        return Inertia::render('admin/publish-packages/Edit', [
            'publishPackage' => $publishPackage,
        ]);
    }

<<<<<<< HEAD
    public function update(Request $request, PublishPackage $publishPackage) {
=======
    public function update(Request $request, PublishPackage $publishPackage)
    {
>>>>>>> live-main
        $data = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric|decimal:2|min:0',
            'features' => 'nullable|array',
<<<<<<< HEAD
            'stripe_price_id' => 'required|string',
=======
>>>>>>> live-main
            'is_active' => 'boolean',
        ]);

        if (isset($data['features'])) {
            $data['features'] = is_array($data['features']) ? $data['features'] : [];
        } else {
            $data['features'] = [];
        }

        $data['is_active'] = $data['is_active'] ?? true;

<<<<<<< HEAD
        $publishPackage->update($data);
        return redirect()->route('admin-dashboard.publish-packages.index')
            ->with('success', 'Publish Package updated successfully.');
    }

    public function destroy(PublishPackage $publishPackage) {
        $publishPackage->delete();
        return redirect()->route('admin-dashboard.publish-packages.index')
            ->with('success', 'Publish Package deleted successfully.');
=======
        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            if ($publishPackage->stripe_price_id) {
                $price = Price::retrieve($publishPackage->stripe_price_id);
                $productId = $price->product ?? null;

                if ($productId) {
                    // ⚡ Update product details in Stripe
                    Product::update($productId, [
                        'name' => $data['name'],
                        'description' => !empty($data['features'])
                            ? implode(', ', $data['features'])
                            : 'Story publication package for StoryVault.',
                    ]);
                }
            }

            // ⚡ Update local DB
            $publishPackage->update($data);

            return redirect()
                ->route('admin-dashboard.publish-packages.index')
                ->with('success', 'Publish Package updated successfully in Stripe and local database.');
        } catch (Exception $e) {
            return back()->with('error', 'Stripe update failed: ' . $e->getMessage());
        }
    }

    public function destroy(PublishPackage $publishPackage)
    {
        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            if ($publishPackage->stripe_price_id) {
                $price = Price::retrieve($publishPackage->stripe_price_id);
                $productId = $price->product ?? null;

                if ($productId) {
                    // ⚡ Archive product on Stripe
                    Product::update($productId, ['active' => false]);
                }
            }

            $publishPackage->delete();

            return redirect()
                ->route('admin-dashboard.publish-packages.index')
                ->with('success', 'Publish Package deleted locally and archived in Stripe.');
        } catch (Exception $e) {
            return back()->with('error', 'Stripe deletion failed: ' . $e->getMessage());
        }
>>>>>>> live-main
    }
}
