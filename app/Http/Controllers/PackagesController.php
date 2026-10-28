<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Services\Stripe\PackageCatalogService;
use Inertia\Inertia;
use Inertia\Response;

class PackagesController extends Controller
{
    public function __construct(protected PackageCatalogService $catalog)
    {
    }

    /**
     * Public packages page — only packages purchasable with the current Stripe account.
     */
    public function index(): Response
    {
        return Inertia::render('Packages', [
            'packages' => $this->catalog->publiclyPurchasable(),
            'inviteMode' => false,
        ]);
    }

    /**
     * Private invite link for hidden packages (e.g. Free).
     */
    public function invite(string $token): Response
    {
        $package = Package::where('invite_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        if (! $this->catalog->belongsToCurrentAccount($package)) {
            abort(404);
        }

        return Inertia::render('Packages', [
            'packages' => collect([$package]),
            'inviteMode' => true,
            'invitePackage' => $package,
        ]);
    }
}
