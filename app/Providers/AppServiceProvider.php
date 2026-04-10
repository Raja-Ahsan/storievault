<?php

namespace App\Providers;

use App\Models\Post;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::bind('blog_post', fn (string $value) => Post::whereKey($value)->firstOrFail());

        Vite::prefetch(concurrency: 3);
        Inertia::share([
            'today' => Carbon::now()->format('F j, Y'),
            'auth' => function () {
                $user = auth()->user();
    
                return [
                    'user' => $user,
                    'subscription_active' => $user?->subscription?->ends_at?->isFuture() ?? false,
                ];
            },
            'categories' => function () {
                return \App\Models\Category::orderBy('name')->get();
            },
        ]);
    }
}

