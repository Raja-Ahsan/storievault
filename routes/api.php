<?php

use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\Admin\CouponController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// Discount code validation endpoint
Route::post('/validate-discount-code', [CouponController::class, 'validateDiscountCode']);

