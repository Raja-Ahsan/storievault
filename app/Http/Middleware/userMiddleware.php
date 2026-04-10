<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class userMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is not logged in
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Check if user is a guest (is_guest = 1)
        if ($user->is_guest) {
            return redirect()->route('register')->with('error', 'Guest users cannot publish stories. Please create a full account to continue.');
        }

        // Check if user account is inactive (is_active = 0)
        if (!$user->is_active) {
            return redirect()->route('login')->with('error', 'Your account is inactive. Please contact support for assistance.');
        }

        // Check if user has proper user group (existing logic)
        if ($user->user_group != '2' && $user->user_group != '1') {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
