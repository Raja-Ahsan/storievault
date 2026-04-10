<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $totalStories = $user->stories()->count();
        $publishedStories = $user->stories()->where('status', 'published')->count();
        $totalReads = $user->stories()->sum('read_count');

        // Get total likes and comments for user's stories
        $totalLikes = $user->stories()->sum('likes_count');
        $totalComments = $user->stories()->sum('comment_count');

        // Get subscription status
        $subscriptionStatus = 'No Subscription';
        $subscriptionPackage = null;
        $subscriptionPurchasedDate = null;
        $subscriptionExpireDate = null;

        if ($user->subscription) {
            // Map Stripe status to user-friendly messages
            $statusMap = [
                'active' => 'Active',
                'canceled' => 'Canceled',
                'past_due' => 'Past Due',
                'incomplete' => 'Incomplete',
                'incomplete_expired' => 'Expired',
                'trialing' => 'Trial',
                'unpaid' => 'Unpaid',
            ];

            $stripeStatus = $user->subscription->stripe_status;
            $subscriptionStatus = $statusMap[$stripeStatus] ?? ucfirst($stripeStatus);
            $subscriptionPackage = $user->subscription->package ? $user->subscription->package->name : null;

            // Get subscription dates
            $subscriptionPurchasedDate = $user->subscription->created_at;

            // Calculate expiration date based on subscription type and billing cycle
            if ($user->subscription->ends_at) {
                // If subscription has an explicit end date (cancelled, etc.)
                $subscriptionExpireDate = $user->subscription->ends_at;
            } else {
                // For active subscriptions, calculate based on billing cycle
                $package = $user->subscription->package;
                if ($package && $package->interval) {
                    $purchaseDate = clone $user->subscription->created_at;
                    if ($package->interval === 'monthly') {
                        $subscriptionExpireDate = $purchaseDate->addMonth();
                    } elseif ($package->interval === 'yearly') {
                        $subscriptionExpireDate = $purchaseDate->addYear();
                    } else {
                        // Default to monthly if interval is not specified
                        $subscriptionExpireDate = $purchaseDate->addMonth();
                    }
                } else {
                    // If no package or interval, set to null
                    $subscriptionExpireDate = null;
                }
            }

            // For active subscriptions without explicit end dates, show next billing cycle
            if (!$subscriptionExpireDate && $user->subscription->stripe_status === 'active') {
                $package = $user->subscription->package;
                if ($package && $package->interval) {
                    $purchaseDate = clone $user->subscription->created_at;
                    if ($package->interval === 'monthly') {
                        $subscriptionExpireDate = $purchaseDate->addMonth();
                    } elseif ($package->interval === 'yearly') {
                        $subscriptionExpireDate = $purchaseDate->addYear();
                    }
                }
            }

            // Debug logging
            \Log::info('Subscription dates calculation', [
                'user_id' => $user->id,
                'subscription_id' => $user->subscription->id,
                'stripe_status' => $user->subscription->stripe_status,
                'package_interval' => $user->subscription->package?->interval ?? 'none',
                'created_at' => $user->subscription->created_at,
                'ends_at' => $user->subscription->ends_at,
                'calculated_expire_date' => $subscriptionExpireDate,
            ]);
        }

        // Get daily usage data - only count approved stories
        $today = now()->startOfDay();
        $dailyStories = $user->stories()
            ->where('is_community', true)
            ->where('status', 'approved')
            ->whereDate('created_at', $today)
            ->get();

        $dailyWords = $dailyStories->sum(function ($story) {
            return str_word_count(strip_tags($story->content));
        });

        $monthlyStories = $user->stories()
            ->where('is_community', true)
            ->where('status', 'approved')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Get package limits
        // Get package limits - ONLY for active subscriptions
        $dailyWordLimit = ($user->subscription && $user->subscription->stripe_status === 'active')
            ? ($user->subscription->package?->words_limit ?? 0)
            : 0;
        $monthlyStoryLimit = ($user->subscription && $user->subscription->stripe_status === 'active')
            ? ($user->subscription->package?->stories_limit ?? 0)
            : 0;

        // Get pending story counts for informational purposes
        $pendingStories = $user->stories()
            ->where('is_community', true)
            ->where('status', 'pending')
            ->count();

        $pendingStoriesThisMonth = $user->stories()
            ->where('is_community', true)
            ->where('status', 'pending')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return Inertia::render('user/Dashboard', [
            'metrics' => [
                'totalStories' => $totalStories,
                'publishedStories' => $publishedStories,
                'totalReads' => $totalReads,
                'totalLikes' => $totalLikes,
                'totalComments' => $totalComments,
                'subscriptionStatus' => $subscriptionStatus,
                'subscriptionPackage' => $subscriptionPackage,
                'subscriptionEndsAt' => $user->subscription?->ends_at,
                'isTrialing' => $user->subscription?->stripe_status === 'trialing',
                'subscriptionPurchasedDate' => $subscriptionPurchasedDate,
                'subscriptionExpireDate' => $subscriptionExpireDate,
                'subscriptionId' => $user->subscription?->id,
                'cancelAtPeriodEnd' => $user->subscription?->cancel_at_period_end,
                'dailyWords' => $dailyWords,
                'dailyWordLimit' => $dailyWordLimit,
                'monthlyStories' => $monthlyStories,
                'monthlyStoryLimit' => $monthlyStoryLimit,
                'pendingStories' => $pendingStories,
                'pendingStoriesThisMonth' => $pendingStoriesThisMonth,
            ]
        ]);
    }
}
