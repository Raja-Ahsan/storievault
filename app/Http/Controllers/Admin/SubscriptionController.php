<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the subscriptions.
     */
    public function index(Request $request)
    {
        $query = Subscription::with(['user', 'package']);
        
        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            switch ($request->status) {
                case 'active':
                    $query->where('stripe_status', 'active');
                    break;
                case 'expired':
                    $query->where(function($q) {
                        $q->where('stripe_status', 'canceled')
                          ->orWhere('stripe_status', 'incomplete_expired')
                          ->orWhere('ends_at', '<', now());
                    });
                    break;
                case 'trialing':
                    $query->where('stripe_status', 'trialing');
                    break;
                case 'past_due':
                    $query->where('stripe_status', 'past_due');
                    break;
            }
        }
        
        $subscriptions = $query->latest()->paginate(15);
        
        // Get subscription statistics
        $stats = [
            'total' => Subscription::count(),
            'active' => Subscription::where('stripe_status', 'active')->count(),
            'trialing' => Subscription::where('stripe_status', 'trialing')->count(),
            'expired' => Subscription::whereIn('stripe_status', ['canceled', 'incomplete_expired'])
                ->orWhere('ends_at', '<', now())->count(),
            'past_due' => Subscription::where('stripe_status', 'past_due')->count(),
        ];
        
        return Inertia::render('admin/subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'stats' => $stats,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Display the specified subscription.
     */
    public function show(Subscription $subscription)
    {
        $subscription->load(['user', 'package']);
        
        return Inertia::render('admin/subscriptions/Show', [
            'subscription' => $subscription,
        ]);
    }

    /**
     * Show users with subscriptions.
     */
    public function usersWithSubscriptions()
    {
        $users = User::whereHas('subscription')
            ->with(['subscription.package'])
            ->latest()
            ->paginate(15);
            
        return Inertia::render('admin/subscriptions/UsersWithSubscriptions', [
            'users' => $users,
        ]);
    }

    /**
     * Show users without subscriptions.
     */
    public function usersWithoutSubscriptions()
    {
        $users = User::whereDoesntHave('subscription')
            ->where('is_guest', false)
            ->latest()
            ->paginate(15);
            
        return Inertia::render('admin/subscriptions/UsersWithoutSubscriptions', [
            'users' => $users,
        ]);
    }
}
