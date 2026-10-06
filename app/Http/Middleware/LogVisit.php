<?php

namespace App\Http\Middleware;

use App\Models\Visit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        try {
            Visit::create([
                'user_id' => Auth::id(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'visited_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Never break checkout/payments because analytics logging failed
            Log::warning('Visit logging skipped: '.$e->getMessage());
        }

        return $next($request);
    }

    protected function shouldSkip(Request $request): bool
    {
        if (app()->environment('testing')) {
            return true;
        }

        return $request->is('admin-dashboard*')
            || $request->is('admin*')
            || $request->is('*admin*')
            || $request->is('*approve*')
            || $request->is('*reject*')
            || $request->is('*toggle-status*')
            || $request->is('stripe/webhook')
            || $request->is('api/stripe/webhook')
            || $request->is('stripe/checkout')
            || $request->is('stripe/success')
            || $request->is('stripe/cancel')
            || $request->is('stripe/publish-success')
            || $request->is('stripe/publish-cancel');
    }
}
