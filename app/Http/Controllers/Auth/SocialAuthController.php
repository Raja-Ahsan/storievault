<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    // Redirect to Google or Facebook
    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    // Handle callback from Google or Facebook
    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();

            // Check if user already exists
            $user = User::where('provider_id', $socialUser->getId())
                        ->orWhere('email', $socialUser->getEmail())
                        ->first();

            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'No Name',
                    'email' => $socialUser->getEmail(),
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'password' => bcrypt(Str::random(16)), // Random password
                ]);
            }

            Auth::login($user);

            return redirect()->route('home'); // Redirect to home page

        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['social_login' => 'Failed to login using ' . $provider]);
        }
    }
}
