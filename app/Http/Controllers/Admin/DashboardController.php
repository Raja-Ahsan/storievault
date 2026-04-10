<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Story;
use App\Models\User;
use Illuminate\Support\Facades\DB;


class DashboardController extends Controller
{
    public function index()
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();

        $visits = Visit::where('visited_at', '>=', $startOfMonth)->count();
        $uniqueUsers = Visit::where('visited_at', '>=', $startOfMonth)->distinct('ip_address')->count('ip_address');
        $pageviews = $visits;
        $newUsers = User::where('created_at', '>=', $startOfMonth)->count();

        // Payment metrics - Only real payments (with publish_request_id)
        $totalIncome = (float) Payment::where('status', 'succeeded')
            ->whereNotNull('publish_request_id')
            ->sum('amount');
        $monthlyIncome = (float) Payment::where('status', 'succeeded')
            ->whereNotNull('publish_request_id')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('amount');
        $totalPayments = Payment::where('status', 'succeeded')
            ->whereNotNull('publish_request_id')
            ->count();
        $monthlyPayments = Payment::where('status', 'succeeded')
            ->whereNotNull('publish_request_id')
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        // Monthly payment data for chart - Only real payments
        $monthlyPaymentData = Payment::where('status', 'succeeded')
            ->whereNotNull('publish_request_id')
            ->where('created_at', '>=', $now->copy()->subMonths(6))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total_amount')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                    'amount' => (float) $item->total_amount,
                ];
            });

        return Inertia::render('admin/Dashboard', [
            'metrics' => [
                'visits' => $visits,
                'uniqueUsers' => $uniqueUsers,
                'pageviews' => $pageviews,
                'newUsers' => $newUsers,
                'usersCount' => User::count(),
                'totalUsers' => User::count(),
                'communityStoriesCount' => Story::community()->count(),
                'adminStoriesCount' => Story::standard()->count(),
                'userCountsByMonth' => User::monthlyRegistrations(),
                'communityStoriesByMonth' => Story::monthlyCountsByType('community'),
                'adminStoriesByMonth' => Story::monthlyCountsByType('admin'),
                // Payment metrics
                'totalIncome' => $totalIncome,
                'monthlyIncome' => $monthlyIncome,
                'totalPayments' => $totalPayments,
                'monthlyPayments' => $monthlyPayments,
                'monthlyPaymentData' => $monthlyPaymentData,
            ],
        ]);
    }
}
