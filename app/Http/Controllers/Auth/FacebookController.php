<?php
namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class FacebookController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('facebook')->redirect();
    }

    public function callback()
    {
        try {
            $facebookUser = Socialite::driver('facebook')->user();

            $user = User::firstOrCreate(
                ['email' => $facebookUser->getEmail()],
                [
                    'name' => $facebookUser->getName(),
                    'password' => bcrypt(uniqid()), // optional
                    'provider_id' => $facebookUser->getId(), // optional field
                ]
            );

            Auth::login($user);
            return redirect()->route('home');

        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['facebook' => 'Facebook login failed']);
        }
    }
}
