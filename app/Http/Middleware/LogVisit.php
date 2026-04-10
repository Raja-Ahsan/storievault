<?php

namespace App\Http\Middleware;

use App\Models\Visit;
use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogVisit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip logging for admin dashboard routes and admin-related actions
        if ($request->is('admin-dashboard*') || 
            $request->is('admin*') || 
            $request->is('*admin*') ||
            $request->is('*approve*') ||
            $request->is('*reject*') ||
            $request->is('*toggle-status*')) {
            return $next($request);
        }

        Visit::create([
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'visited_at' => now(),
        ]);

        return $next($request);
    }
}
