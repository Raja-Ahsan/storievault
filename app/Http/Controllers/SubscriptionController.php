<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Subscription;
use App\Models\Subscription as LocalSubscription;   
use Stripe\StripeClient;

class SubscriptionController extends Controller
{
    public function subscribe(Request $request, Package $package)
    {
        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));

            $user = $request->user();
            $paymentMethod = $request->input('payment_method');

            // Create or get Stripe customer
            $customer = $this->getOrCreateStripeCustomer($user);

            // Attach payment method to customer
            $this->attachPaymentMethodToCustomer($paymentMethod, $customer->id);

            // Create subscription
            $subscription = Subscription::create([
                'customer' => $customer->id,
                'items' => [['price' => $package->stripe_price_id]],
                'default_payment_method' => $paymentMethod,
                'expand' => ['latest_invoice.payment_intent'],
            ]);

            // Update user with subscription info
            $user->update([
                'stripe_customer_id' => $customer->id,
                'stripe_subscription_id' => $subscription->id,
            ]);

            LocalSubscription::create([
                'user_id' => $user->id,
                'type' => 'stripe',
                'stripe_id' => $subscription->id,
                'stripe_status' => $subscription->status,
                'stripe_price' => $package->stripe_price_id,
                'quantity' => $subscription->quantity ?? 1,
                'trial_ends_at' => $subscription->trial_end ? now()->addSeconds($subscription->trial_end - time()) : null,
                'ends_at' => $subscription->cancel_at ? now()->addSeconds($subscription->cancel_at - time()) : null,
            ]);

            // Log the subscription creation for debugging
            Log::info('Subscription created for user ' . $user->id . ' with status: ' . $subscription->status);

            return response()->json(['success' => true, 'subscription_id' => $subscription->id]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    private function getOrCreateStripeCustomer($user)
    {
        if ($user->stripe_customer_id) {
            return Customer::retrieve($user->stripe_customer_id);
        }

        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);

        return $customer;
    }

    private function attachPaymentMethodToCustomer($paymentMethod, $customerId)
    {
        $paymentMethodObj = \Stripe\PaymentMethod::retrieve($paymentMethod);
        $paymentMethodObj->attach(['customer' => $customerId]);
    }

    public function success()
    {
        return inertia('Subscription/Success'); // React/Inertia page for confirmation
    }

    /**
     * Renew an existing subscription
     */
    public function renew(Request $request)
    {
        try {
            $user = $request->user();

            // Check if user has an active subscription
            $subscription = $user->subscription;
            if (!$subscription) {
                return response()->json(['error' => 'No active subscription found'], 404);
            }

            if ($subscription->stripe_status !== 'active') {
                return response()->json(['error' => 'Subscription is not active'], 400);
            }

            // Get the package details
            $package = $subscription->package;
            if (!$package) {
                return response()->json(['error' => 'Package not found'], 404);
            }

            Stripe::setApiKey(env('STRIPE_SECRET'));

            // Get the current Stripe subscription
            $stripeSubscription = \Stripe\Subscription::retrieve($subscription->stripe_id);

            // Check if user has a default payment method
            if (!$stripeSubscription->default_payment_method) {
                return response()->json(['error' => 'No payment method found. Please add a payment method first.'], 400);
            }

            // Create a new invoice for the renewal period
            $invoice = \Stripe\Invoice::create([
                'customer' => $stripeSubscription->customer,
                'subscription' => $stripeSubscription->id,
                'description' => 'Early renewal for ' . $package->name . ' package',
                'metadata' => [
                    'renewal_type' => 'early_renewal',
                    'user_id' => $user->id,
                    'package_name' => $package->name,
                ],
            ]);

            // Finalize the invoice
            $invoice->finalize();

            // Pay the invoice using the default payment method
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => $this->getPackagePrice($package),
                'currency' => 'usd',
                'customer' => $stripeSubscription->customer,
                'payment_method' => $stripeSubscription->default_payment_method,
                'confirm' => true,
                'description' => 'Early renewal payment for ' . $package->name,
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'user_id' => $user->id,
                    'package_name' => $package->name,
                    'renewal_type' => 'early_renewal',
                ],
            ]);

            // Check if payment was successful
            if ($paymentIntent->status === 'succeeded') {
                // Calculate new end date based on package interval
                $newEndDate = null;
                if ($package->interval === 'monthly') {
                    $newEndDate = now()->addMonth();
                } elseif ($package->interval === 'yearly') {
                    $newEndDate = now()->addYear();
                } else {
                    // Default to monthly if interval is not specified
                    $newEndDate = now()->addMonth();
                }

                // Update the local subscription record
                $subscription->update([
                    'ends_at' => $newEndDate,
                    'updated_at' => now(),
                ]);

                // Log the successful renewal with payment
                Log::info('Subscription renewed with payment for user ' . $user->id . ' - Payment ID: ' . $paymentIntent->id . ' - New end date: ' . $newEndDate);

                return response()->json([
                    'success' => true,
                    'message' => 'Subscription renewed successfully',
                    'new_end_date' => $newEndDate,
                    'package_name' => $package->name,
                    'interval' => $package->interval,
                    'payment_id' => $paymentIntent->id,
                    'amount_paid' => $this->formatAmount($paymentIntent->amount),
                ]);
            } else {
                throw new \Exception('Payment failed with status: ' . $paymentIntent->status);
            }
        } catch (\Exception $e) {
            Log::error('Subscription renewal failed: ' . $e->getMessage());
            return response()->json(['error' => 'Renewal failed: ' . $e->getMessage()], 500);
        }
    }


    public function toggleRenewal($id)
    {
        try {
            $user = auth()->user();
            $subscription = LocalSubscription::findOrFail($id);

            // Check if user is admin or owns the subscription
            if (!$user->is_admin && $subscription->user_id !== $user->id) {
                return response()->json([
                    'error' => 'Unauthorized. You can only toggle your own subscription.'
                ], 403);
            }

            // Stripe client init
            $stripe = new StripeClient(config('services.stripe.secret'));

            // Fetch current subscription from Stripe
            $stripeSub = $stripe->subscriptions->retrieve($subscription->stripe_id);

            // Check if subscription is canceled
            if ($stripeSub->status === 'canceled') {
                return response()->json([
                    'error' => 'Cannot toggle renewal for a canceled subscription. Please create a new subscription.'
                ], 400);
            }

            // Toggle cancel_at_period_end
            $newValue = !$stripeSub->cancel_at_period_end;

            $updatedSub = $stripe->subscriptions->update($subscription->stripe_id, [
                'cancel_at_period_end' => $newValue,
            ]);

            // Update local DB
            $subscription->update([
                'cancel_at_period_end' => $updatedSub->cancel_at_period_end,
                'ends_at' => $updatedSub->cancel_at ? \Carbon\Carbon::createFromTimestamp($updatedSub->cancel_at) : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => $newValue
                    ? 'Auto-renewal disabled, subscription will end at period end.'
                    : 'Auto-renewal enabled, subscription will continue.',
                'subscription' => $subscription
            ]);
        } catch (\Exception $e) {
            Log::error('Toggle renewal failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to toggle renewal: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get the package price in cents
     */
    private function getPackagePrice($package)
    {
        // Check if package has price_cents field (stored in cents)
        if (isset($package->price_cents) && $package->price_cents > 0) {
            return (int)$package->price_cents; // Already in cents
        }

        // Fallback to price field if price_cents is not set
        if (isset($package->price) && $package->price > 0) {
            return (int)($package->price * 100); // Convert dollars to cents
        }

        // Default prices if not set in database
        switch (strtolower($package->name)) {
            case 'basic':
            case 'standard':
                return 1900; // $19.00
            case 'premium':
                return 2900; // $29.00
            case 'enterprise':
                return 4900; // $49.00
            default:
                return 1900; // Default to $19.00
        }
    }

    /**
     * Format amount from cents to dollars
     */
    private function formatAmount($amountInCents)
    {
        return '$' . number_format($amountInCents / 100, 2);
    }
}
