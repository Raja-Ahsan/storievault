<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\LogVisit::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'user' => \App\Http\Middleware\userMiddleware::class,
            'subscription' => \App\Http\Middleware\SubscriptionMiddleware::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Wrong URL ya missing resource (404) → home redirect
        $exceptions->respond(function ($response, $exception, $request) {
            if ($request->expectsJson()) {
                return $response;
            }
            if (in_array($exception::class, [
                \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
                \Illuminate\Database\Eloquent\ModelNotFoundException::class,
            ])) {
                return redirect()->route('home');
            }
            return $response;
        });
    })->create();
