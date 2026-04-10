<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Mail\CouponMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;


class CouponController extends Controller
{
    public function index()
    {
        $coupons = Coupon::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/coupons/Index', [
            'coupons' => $coupons,
        ]);
    }

    public function create()
    {
        // Get users who have featured stories (community stories)
        $featuredStories = Story::where('is_community', true)
            ->orderByRaw('
        (read_count * 0.5) + (comment_count * 0.3) + (likes_count * 0.2) DESC')
            ->take(5)
            ->get();

        $featuredUserIds = $featuredStories->pluck('user_id'); // sirf user IDs nikal lo

        $featuredUsers = User::whereIn('id', $featuredUserIds)
            ->select('id', 'name', 'email')
            ->withCount('stories')
            ->get();

        return Inertia::render('admin/coupons/Create', [
            'users' => $featuredUsers,
        ]);
    }

    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'code' => 'required|string',
            'discount_value' => 'required|numeric|min:1|max:100',
            'users' => 'required|array|min:1',
            'users.*' => 'exists:users,id',
        ]);
        
        try {
            // Create coupons for each selected user with unique codes
            $createdCoupons = [];
            $baseCode = $request->code;
            
            foreach ($request->users as $index => $userId) {
                // Get the user object
                $user = User::find($userId);
                
                // Get the user's featured story (the one that qualified them for the coupon)
                $featuredStory = Story::where('user_id', $userId)
                    ->where('is_community', true)
                    ->orderByRaw('(read_count * 0.5) + (comment_count * 0.3) + (likes_count * 0.2) DESC')
                    ->first();
                
                // Generate unique code for each user
                $uniqueCode = $baseCode . '_' . ($index + 1);
                
                // Ensure the code is unique in the database
                $counter = 1;
                while (Coupon::where('code', $uniqueCode)->exists()) {
                    $uniqueCode = $baseCode . '_' . ($index + 1) . '_' . $counter;
                    $counter++;
                }
                
                $coupon = Coupon::create([
                    'user_id' => $userId,
                    'code' => $uniqueCode,
                    'discount' => $request->discount_value,
                    'is_used' => false,
                ]);

                // Load the user relationship for the email
                $coupon->load('user');

                // Send email to the user with story information
                if ($user && $user->email) {
                    try {
                        Mail::to($user->email)->send(new CouponMail($coupon, $featuredStory));
                    } catch (\Exception $e) {
                        // Log the error but don't fail the entire process
                        Log::error('Failed to send coupon email to ' . $user->email . ': ' . $e->getMessage());
                    }
                }

                $createdCoupons[] = $coupon;
            }

            return redirect()->back()->with('success', 
                'Coupons created successfully! ' . count($createdCoupons) . ' coupon(s) have been generated for the selected users.'
            );

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to create coupons. Please try again.'
            ]);
        }
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);
        
        $request->validate([
            'is_used' => 'required|boolean',
        ]);

        $coupon->update([
            'is_used' => $request->is_used,
        ]);

        return redirect()->back()->with('success', 'Coupon status updated successfully!');
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return redirect()->back()->with('success', 'Coupon deleted successfully!');
    }

    public function validateDiscountCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);
        
        $coupon = Coupon::where('code', $request->code)
            ->where('is_used', false)
            ->first();
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired discount code'
            ]);
        }
        
        return response()->json([
            'success' => true,
            'discount' => $coupon->discount,
            'message' => 'Discount code applied successfully!'
        ]);
    }
}
