<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\PublishRequest;
use App\Models\Payment;
use App\Models\User;
use Exception;

class StripeController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        try {
            // Ensure user is authenticated
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            Stripe::setApiKey(config('services.stripe.secret'));

            $domain = env('APP_URL');
            $mode = $request->input('mode', 'subscription'); // 'subscription' or 'payment'
            
            if ($mode === 'subscription') {
                // Existing subscription logic
                $packageName = $request->input('package_name', 'Default Package');
                $amount = $request->input('amount', 1900);
                $packagePriceId = $request->input('stripe_price_id');
                
                if (!$packagePriceId) {
                    return response()->json(['error' => 'Stripe Price ID missing'], 422);
                }

                $session = Session::create([
                    'payment_method_types' => ['card'],
                    'mode' => 'subscription',
                    'customer_email' => $user->email,
                    'line_items' => [[
                        'price'    => $packagePriceId,   // recurring price id (not unit_amount)
                        'quantity' => 1,
                    ]],
                    'success_url' => $domain . '/stripe/success?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => $domain . '/stripe/cancel',
                ]);
            } else {
                // One-time payment logic for story publishing
                $amount = $request->input('amount', 1900);
                $storyTitle = $request->input('story_title', 'Story Publication');
                $stripePriceId = $request->input('stripe_price_id');
                
                // Get story data for creating publish request after payment
                $storyData = [
                    'story_id' => $request->input('story_id'),
                    'character' => $request->input('character'),
                    'content' => $request->input('content'),
                    'title' => $request->input('title'),
                    'genre' => $request->input('genre'),
                    'rating' => $request->input('rating'),
                    'cover_image' => $request->input('cover_image'),
                    'package_id' => $request->input('package_id'),
                    'package_name' => $request->input('package_name'),
                    'package_price' => $request->input('package_price'),
                ];
                
                // Store story data in session instead of Stripe metadata (due to 500 char limit)
                session(['story_publish_data' => $storyData]);

                if ($stripePriceId) {
                    // Use existing Stripe price if available
                    $session = Session::create([
                        'payment_method_types' => ['card'],
                        'mode' => 'payment',
                        'customer_email' => $user->email,
                        'line_items' => [[
                            'price' => $stripePriceId,
                            'quantity' => 1,
                        ]],
                        'success_url' => $domain . '/stripe/publish-success?session_id={CHECKOUT_SESSION_ID}',
                        'cancel_url' => $domain . '/stripe/publish-cancel',
                        'metadata' => [
                            'user_id' => $user->id,
                            'story_title' => $storyTitle,
                            'story_id' => $storyData['story_id'],
                            'discount_applied' => $request->input('discount_applied') ? 'true' : 'false',
                            'discount_code' => $request->input('discount_code', ''),
                            'final_price' => $request->input('final_price', $amount / 100),
                        ],
                    ]);
                } else {
                    // Create dynamic price if no Stripe price ID
                    $session = Session::create([
                        'payment_method_types' => ['card'],
                        'mode' => 'payment',
                        'customer_email' => $user->email,
                        'line_items' => [[
                            'price_data' => [
                                'currency' => 'usd',
                                'product_data' => [
                                    'name' => $storyTitle . ' Publication',
                                    'description' => 'One-time payment for story publication review',
                                ],
                                'unit_amount' => $amount,
                            ],
                            'quantity' => 1,
                        ]],
                        'success_url' => $domain . '/stripe/publish-success?session_id={CHECKOUT_SESSION_ID}',
                        'cancel_url' => $domain . '/stripe/publish-cancel',
                        'metadata' => [
                            'user_id' => $user->id,
                            'story_title' => $storyTitle,
                            'story_id' => $storyData['story_id'],
                            'discount_applied' => $request->input('discount_applied', false),
                            'discount_code' => $request->input('discount_code', ''),
                            'final_price' => $request->input('final_price', $amount / 100),
                        ],
                    ]);
                }
            }

            return response()->json(['id' => $session->id]);
            
        } catch (\Exception $e) {
            Log::error('Error creating checkout session: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create checkout session: ' . $e->getMessage()], 500);
        }
    }

    public function success(Request $request)
    {
        $sessionId = $request->query('session_id');
        
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            
            // Retrieve the checkout session to get subscription details
            $session = \Stripe\Checkout\Session::retrieve($sessionId);
            
            if ($session->payment_status === 'paid' && $session->subscription) {
                $user = Auth::user();
                
                // Get the subscription details from Stripe
                $subscription = \Stripe\Subscription::retrieve($session->subscription);
                
                // Get package details from the Stripe price ID
                $package = \App\Models\Package::where('stripe_price_id', $subscription->items->data[0]->price->id)->first();
                
                // Create or update the local subscription record
                \App\Models\Subscription::updateOrCreate(
                    ['stripe_id' => $subscription->id],
                    [
                        'user_id' => $user->id,
                        'type' => 'stripe',
                        'stripe_status' => $subscription->status,
                        'stripe_price' => $subscription->items->data[0]->price->id,
                        'quantity' => $subscription->quantity ?? 1,
                        'trial_ends_at' => $subscription->trial_end ? now()->addSeconds($subscription->trial_end - time()) : null,
                        'ends_at' => $subscription->cancel_at ? now()->addSeconds($subscription->cancel_at - time()) : null,
                    ]
                );
                
                // Update user with Stripe customer ID if not set
                if (!$user->stripe_customer_id && $subscription->customer) {
                    $user->update(['stripe_customer_id' => $subscription->customer]);
                }
                
                Log::info('Subscription created successfully for user ' . $user->id . ' with status: ' . $subscription->status);
                
                // Return Inertia response with success page data
                return Inertia::render('SubscriptionSuccess', [
                    'package' => $package,
                    'subscription' => [
                        'id' => $subscription->id,
                        'status' => $subscription->status,
                        'current_period_start' => $subscription->current_period_start,
                        'current_period_end' => $subscription->current_period_end,
                    ],
                    'user' => [
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                ]);
            }
            
            return Inertia::render('SubscriptionSuccess', [
                'error' => 'Payment verification failed.',
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error processing successful payment: ' . $e->getMessage());
            return Inertia::render('SubscriptionSuccess', [
                'error' => 'Error processing payment: ' . $e->getMessage(),
            ]);
        }
    }

    public function cancel()
    {
        return "Payment Cancelled!";
    }

    public function publishSuccess(Request $request)
    {
        $sessionId = $request->query('session_id');
        
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            
            // Retrieve the checkout session to get payment details
            $session = \Stripe\Checkout\Session::retrieve($sessionId);
            
            if ($session->payment_status === 'paid') {
                // Get story data from session instead of metadata
                $storyData = session('story_publish_data');
                $user = Auth::user();
                
                if (!$storyData) {
                    throw new Exception('Story data not found in session');
                }
                
                // Create the publish request after successful payment
                $publishRequest = \App\Models\PublishRequest::create([
                    'user_id' => $user->id,
                    'package_id' => $storyData['package_id'],
                    'cover_image' => $storyData['cover_image'],
                    'story_id' => $storyData['story_id'],
                    'title' => $storyData['title'],
                    'character' => $storyData['character'],
                    'genre' => $storyData['genre'],
                    'rating' => $storyData['rating'],
                    'content' => $storyData['content'],
                    'status' => 'pending',
                    'payment_status' => 'paid',
                    'stripe_session_id' => $sessionId,
                    'paid_at' => now(),
                ]);
                
                // Create payment record
                \App\Models\Payment::create([
                    'user_id' => $user->id,
                    'publish_request_id' => $publishRequest->id,
                    'stripe_payment_intent_id' => $session->payment_intent,
                    'amount' => $session->amount_total / 100, // Convert from cents
                    'currency' => 'USD',
                    'status' => 'succeeded',
                    'payment_method' => 'card',
                    'description' => 'Story Publishing Package - ' . $storyData['title'],
                ]);
                
                // Mark coupon as used if discount was applied
                if ($session->metadata && isset($session->metadata['discount_applied']) && $session->metadata['discount_applied'] === 'true') {
                    $discountCode = $session->metadata['discount_code'] ?? '';
                    if ($discountCode) {
                        \App\Models\Coupon::where('code', $discountCode)
                            ->where('is_used', false)
                            ->update(['is_used' => true]);
                    }
                }
                
                // Clear the session data after successful creation
                session()->forget('story_publish_data');
                
                Log::info('Publish request created and payment successful: ' . $publishRequest->id);
                
                return Inertia::render('PublishSuccess', [
                    'publishRequest' => $publishRequest,
                    'session' => [
                        'id' => $session->id,
                        'payment_status' => $session->payment_status,
                        'amount_total' => $session->amount_total,
                    ],
                ]);
            }
            
            return redirect()->route('stories.index')->with('error', 'Payment verification failed.');
            
        } catch (\Exception $e) {
            Log::error('Error processing publish payment success: ' . $e->getMessage());
            return redirect()->route('stories.index')->with('error', 'Error processing payment: ' . $e->getMessage());
        }
    }

    public function publishCancel(Request $request)
    {
        try {
            // No publish request to delete since it was never created
            // Just redirect with cancellation message
            Log::info('Story publication payment cancelled by user');
            
            return redirect()->route('stories.index')->with('info', 'Publication request cancelled. Your story was not submitted.');
            
        } catch (\Exception $e) {
            Log::error('Error processing publish cancellation: ' . $e->getMessage());
            return redirect()->route('stories.index')->with('error', 'Error processing cancellation: ' . $e->getMessage());
        }
    }
}
