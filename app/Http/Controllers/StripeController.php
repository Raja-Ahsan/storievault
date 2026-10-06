<?php

namespace App\Http\Controllers;

use App\Exceptions\CheckoutException;
use App\Models\Coupon;
use App\Models\Package;
use App\Models\Payment;
use App\Models\PublishRequest;
use App\Models\Subscription;
use App\Services\Stripe\StripeCheckoutService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StripeController extends Controller
{
    public function __construct(protected StripeCheckoutService $checkout)
    {
    }

    public function createCheckoutSession(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json([
                'error' => 'Please log in to continue with your subscription.',
            ], 401);
        }

        $lock = null;

        try {
            $lock = $this->checkout->acquireCheckoutLock((int) $user->id);

            $mode = $request->input('mode', 'subscription');

            if ($mode === 'payment') {
                return $this->createPublishCheckout($request, $user);
            }

            return $this->createSubscriptionCheckout($request, $user);
        } catch (CheckoutException $e) {
            Log::warning('Checkout rejected', [
                'user_id' => $user->id,
                'context' => $e->logContext(),
            ]);

            return response()->json(['error' => $e->userMessage()], $e->statusCode());
        } catch (\Throwable $e) {
            Log::error('Unexpected checkout failure', [
                'user_id' => $user->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => "We couldn't start checkout right now. Please try again.",
            ], 500);
        } finally {
            if ($lock) {
                optional($lock)->release();
            }
        }
    }

    protected function createSubscriptionCheckout(Request $request, $user)
    {
        $validated = $request->validate([
            'package_id' => ['required', 'integer'],
        ]);

        $package = $this->checkout->resolveSubscriptionPackage((int) $validated['package_id']);

        // Free / $0 packages: activate locally (invite link flow)
        if ((int) ($package->price_cents ?? 0) === 0 || empty($package->stripe_price_id)) {
            if ($this->checkout->userHasActiveSubscription($user)) {
                return response()->json([
                    'error' => 'You already have an active subscription.',
                ], 409);
            }

            DB::transaction(function () use ($user, $package) {
                Subscription::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'type' => 'free',
                        'stripe_id' => 'free_'.$user->id.'_'.time(),
                        'stripe_status' => 'active',
                        'stripe_price' => $package->stripe_price_id,
                        'quantity' => 1,
                        'trial_ends_at' => null,
                        'ends_at' => null,
                    ]
                );
            });

            return response()->json([
                'free' => true,
                'redirect' => route('subscription.success'),
            ]);
        }

        if ($this->checkout->userHasActiveSubscription($user)) {
            return response()->json([
                'error' => 'You already have an active subscription.',
            ], 409);
        }

        // Never trust browser-sent amount / stripe_price_id
        $session = $this->checkout->createSubscriptionCheckoutSession($user, $package);

        return response()->json(['id' => $session->id]);
    }

    protected function createPublishCheckout(Request $request, $user)
    {
        $validated = $request->validate([
            'package_id' => ['required', 'integer'],
            'story_id' => ['required'],
            'story_title' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'character' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'genre' => ['nullable', 'string', 'max:255'],
            'rating' => ['nullable'],
            'cover_image' => ['nullable', 'string'],
            'discount_code' => ['nullable', 'string', 'max:64'],
            'discount_applied' => ['nullable', 'boolean'],
        ]);

        $package = $this->checkout->resolvePublishPackage((int) $validated['package_id']);

        $storyData = [
            'story_id' => $validated['story_id'],
            'character' => $validated['character'] ?? null,
            'content' => $validated['content'] ?? null,
            'title' => $validated['title'] ?? ($validated['story_title'] ?? 'Story Publication'),
            'genre' => $validated['genre'] ?? null,
            'rating' => $validated['rating'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
            'package_id' => $package->id,
            'package_name' => $package->name,
            'package_price' => $package->price,
        ];

        session(['story_publish_data' => $storyData]);

        $amountCents = (int) round(((float) $package->price) * 100);
        $discountApplied = false;
        $discountCode = '';

        // Authoritative discount: re-validate coupon server-side if provided
        if (! empty($validated['discount_code']) && ! empty($validated['discount_applied'])) {
            $coupon = Coupon::where('code', $validated['discount_code'])
                ->where('is_used', false)
                ->first();

            if ($coupon && (int) $coupon->discount > 0) {
                $pct = (float) $coupon->discount;
                $amountCents = (int) max(50, round($amountCents * (1 - ($pct / 100))));
                $discountApplied = true;
                $discountCode = $coupon->code;
            }
        }

        $metadata = [
            'story_title' => $storyData['title'],
            'story_id' => (string) $storyData['story_id'],
            'discount_applied' => $discountApplied ? 'true' : 'false',
            'discount_code' => $discountCode,
            'final_price' => number_format($amountCents / 100, 2, '.', ''),
        ];

        $override = $discountApplied ? $amountCents : null;
        $session = $this->checkout->createPublishCheckoutSession($user, $package, $metadata, $override);

        return response()->json(['id' => $session->id]);
    }

    /**
     * Success URL: verify session with Stripe. Activation is primarily webhook-driven;
     * this syncs local state for faster UX when the webhook has not landed yet.
     */
    public function success(Request $request)
    {
        $sessionId = $request->query('session_id');
        $friendlyError = 'Your payment could not be verified. If you were charged, your subscription will activate shortly.';

        if (! $sessionId || ! is_string($sessionId) || ! str_starts_with($sessionId, 'cs_')) {
            return Inertia::render('SubscriptionSuccess', ['error' => $friendlyError]);
        }

        try {
            $user = Auth::user();
            if (! $user) {
                return redirect()->route('login');
            }

            $session = $this->checkout->retrieveCheckoutSession($sessionId);

            if ((int) ($session->metadata->user_id ?? $session->client_reference_id ?? 0) !== (int) $user->id) {
                Log::warning('Checkout success user mismatch', [
                    'session_id' => $sessionId,
                    'auth_user' => $user->id,
                ]);

                return Inertia::render('SubscriptionSuccess', ['error' => $friendlyError]);
            }

            $paidStatuses = ['paid', 'no_payment_required'];
            if (! in_array($session->payment_status, $paidStatuses, true) || empty($session->subscription)) {
                return Inertia::render('SubscriptionSuccess', [
                    'error' => 'Your payment is still processing. Please refresh in a moment or check your dashboard.',
                ]);
            }

            $subscriptionId = is_object($session->subscription)
                ? $session->subscription->id
                : $session->subscription;

            $subscription = is_object($session->subscription) && isset($session->subscription->status)
                ? $session->subscription
                : $this->checkout->retrieveSubscription($subscriptionId);

            $priceId = $subscription->items->data[0]->price->id ?? null;
            $package = $priceId
                ? Package::where('stripe_price_id', $priceId)->first()
                : null;

            DB::transaction(function () use ($user, $subscription, $priceId) {
                Subscription::updateOrCreate(
                    ['stripe_id' => $subscription->id],
                    [
                        'user_id' => $user->id,
                        'type' => 'stripe',
                        'stripe_status' => $subscription->status,
                        'stripe_price' => $priceId,
                        'quantity' => $subscription->quantity ?? 1,
                        'trial_ends_at' => $subscription->trial_end
                            ? Carbon::createFromTimestamp($subscription->trial_end)
                            : null,
                        'ends_at' => $subscription->cancel_at
                            ? Carbon::createFromTimestamp($subscription->cancel_at)
                            : null,
                        'cancel_at_period_end' => (bool) ($subscription->cancel_at_period_end ?? false),
                    ]
                );

                if (empty($user->stripe_id) && $subscription->customer) {
                    $user->forceFill(['stripe_id' => $subscription->customer])->save();
                }
            });

            return Inertia::render('SubscriptionSuccess', [
                'package' => $package,
                'subscription' => [
                    'id' => $subscription->id,
                    'status' => $subscription->status,
                    'current_period_start' => $subscription->current_period_start ?? null,
                    'current_period_end' => $subscription->current_period_end ?? null,
                ],
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
        } catch (CheckoutException $e) {
            Log::warning('Checkout success verification failed', ['context' => $e->logContext()]);

            return Inertia::render('SubscriptionSuccess', ['error' => $friendlyError]);
        } catch (\Throwable $e) {
            Log::error('Error processing successful payment', ['message' => $e->getMessage()]);

            return Inertia::render('SubscriptionSuccess', ['error' => $friendlyError]);
        }
    }

    public function cancel()
    {
        return redirect()->route('packages')->with('info', 'Checkout was cancelled. No payment was taken.');
    }

    public function publishSuccess(Request $request)
    {
        $sessionId = $request->query('session_id');
        $friendlyError = 'Your payment could not be verified. If you were charged, your request will appear shortly.';

        if (! $sessionId || ! is_string($sessionId) || ! str_starts_with($sessionId, 'cs_')) {
            return redirect()->route('stories.index')->with('error', $friendlyError);
        }

        try {
            $user = Auth::user();
            if (! $user) {
                return redirect()->route('login');
            }

            $session = $this->checkout->retrieveCheckoutSession($sessionId);

            if ((int) ($session->metadata->user_id ?? $session->client_reference_id ?? 0) !== (int) $user->id) {
                return redirect()->route('stories.index')->with('error', $friendlyError);
            }

            if ($session->payment_status !== 'paid') {
                return redirect()->route('stories.index')->with('error', 'Your payment is still processing. Please check back shortly.');
            }

            // Idempotent: do not create duplicate publish requests for the same session
            $existing = PublishRequest::where('stripe_session_id', $sessionId)->first();
            if ($existing) {
                return Inertia::render('PublishSuccess', [
                    'publishRequest' => $existing,
                    'session' => [
                        'id' => $session->id,
                        'payment_status' => $session->payment_status,
                        'amount_total' => $session->amount_total,
                    ],
                ]);
            }

            $storyData = session('story_publish_data');
            if (! $storyData) {
                // Webhook may have created it already, or session expired after payment
                Log::warning('Publish success missing session story data', ['session_id' => $sessionId]);

                return redirect()->route('user.publish-requests')->with('info', 'Payment received. Your publication request is being processed.');
            }

            $publishRequest = DB::transaction(function () use ($user, $storyData, $session, $sessionId) {
                $publishRequest = PublishRequest::create([
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

                $paymentIntentId = is_object($session->payment_intent)
                    ? $session->payment_intent->id
                    : $session->payment_intent;

                Payment::create([
                    'user_id' => $user->id,
                    'publish_request_id' => $publishRequest->id,
                    'stripe_payment_intent_id' => $paymentIntentId,
                    'amount' => ($session->amount_total ?? 0) / 100,
                    'currency' => 'USD',
                    'status' => 'succeeded',
                    'payment_method' => 'card',
                    'description' => 'Story Publishing Package - '.$storyData['title'],
                ]);

                if (($session->metadata->discount_applied ?? '') === 'true') {
                    $discountCode = $session->metadata->discount_code ?? '';
                    if ($discountCode) {
                        Coupon::where('code', $discountCode)
                            ->where('is_used', false)
                            ->update(['is_used' => true]);
                    }
                }

                return $publishRequest;
            });

            session()->forget('story_publish_data');

            return Inertia::render('PublishSuccess', [
                'publishRequest' => $publishRequest,
                'session' => [
                    'id' => $session->id,
                    'payment_status' => $session->payment_status,
                    'amount_total' => $session->amount_total,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error processing publish payment success', ['message' => $e->getMessage()]);

            return redirect()->route('stories.index')->with('error', $friendlyError);
        }
    }

    public function publishCancel(Request $request)
    {
        session()->forget('story_publish_data');

        return redirect()->route('stories.index')->with('info', 'Publication request cancelled. Your story was not submitted.');
    }

    /**
     * Legacy Elements flow endpoint — Checkout Session is the supported path.
     */
    public function createPaymentIntent()
    {
        return response()->json([
            'error' => "We couldn't start checkout right now. Please use the subscription packages page.",
        ], 410);
    }
}
