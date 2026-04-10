<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
{
    $googleUser = Socialite::driver('google')->user();

    $user = User::updateOrCreate(
        ['email' => $googleUser->getEmail()],
        [
            'name' => $googleUser->getName(),
            'username' => \Illuminate\Support\Str::slug($googleUser->getName()) . '_' . \Illuminate\Support\Str::random(5),
            'avatar' => $googleUser->getAvatar(),
            'password' => bcrypt(Str::random(16)),
        ]
    );

    Auth::login($user);

    return redirect()->route('home');
}
}
