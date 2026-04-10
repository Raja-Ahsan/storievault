<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GuestAuthController extends Controller
{
    /**
     * Handle guest login
     */
    public function guestLogin(Request $request): RedirectResponse
    {
        // Clean up old guest users first
        $this->cleanupOldGuestUsers();

        // Check if there's already a guest user in the session
        if ($request->session()->has('guest_user_id')) {
            $guestUserId = $request->session()->get('guest_user_id');
            $guestUser = User::find($guestUserId);

            if ($guestUser && $guestUser->is_guest) {
                Auth::login($guestUser);
                return redirect()->intended(route('home', absolute: false));
            }
        }

        // Create a temporary guest user
        $guestUser = User::create([
            'name' => 'Guest_' . Str::random(8),
            'username' => 'guest_' . Str::random(10),
            'email' => 'guest_' . Str::random(8) . '@example.com',
            'password' => Hash::make(Str::random(16)),
            'is_guest' => true,
            'is_active' => false, // Guest users should be inactive
        ]);

        // Store the guest user ID in the session
        $request->session()->put('guest_user_id', $guestUser->id);

        // Log in the guest user
        Auth::login($guestUser);

        return redirect()->intended(route('home', absolute: false));
    }

    /**
     * Logout guest user and redirect to register page
     */
    public function logoutAndRegister(Request $request): RedirectResponse
    {
        // Check if the user is a guest
        $user = Auth::user();

        if ($user && $user->is_guest) {
            // Logout the user
            Auth::logout();

            // Delete the guest user
            $user->delete();

            // Invalidate the session
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // Redirect to register page
        return redirect('/register');
    }

    /**
     * Clean up old guest users (older than 24 hours)
     */
    private function cleanupOldGuestUsers()
    {
        // Delete guest users older than 24 hours using query builder
        User::where('is_guest', true)
            ->where('created_at', '<', now()->subHours(24))
            ->delete();
    }
}
