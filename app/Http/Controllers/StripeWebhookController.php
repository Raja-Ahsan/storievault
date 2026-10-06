<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\StripeEvent;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        if (! $secret) {
            Log::error('Stripe webhook secret is not configured');

            return response('Webhook misconfigured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Stripe webhook invalid payload');

            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook invalid signature');

            return response('Invalid signature', 400);
        }

        // Idempotency: claim the event before processing
        try {
            $claimed = StripeEvent::create([
                'event_id' => $event->id,
                'type' => $event->type,
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            Log::info("Stripe event {$event->id} already processed");

            return response('Duplicate', 200);
        }

        try {
            DB::transaction(function () use ($event) {
                match ($event->type) {
                    'checkout.session.completed' => $this->handleCheckoutSessionCompleted($event->data->object),
                    'customer.subscription.created',
                    'customer.subscription.updated' => $this->syncSubscription($event->data->object),
                    'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object),
                    'invoice.payment_succeeded' => $this->handleInvoicePaymentSucceeded($event->data->object),
                    'invoice.payment_failed' => $this->handleInvoicePaymentFailed($event->data->object),
                    default => Log::info('Unhandled Stripe event: '.$event->type),
                };
            });
        } catch (\Throwable $e) {
            // Allow Stripe to retry — remove claim so a later delivery can reprocess
            optional($claimed)->delete();

            Log::error('Stripe webhook handling error', [
                'event' => $event->type,
                'event_id' => $event->id,
                'message' => $e->getMessage(),
            ]);

            return response('Webhook handling error', 500);
        }

        return response('OK', 200);
    }

    protected function handleCheckoutSessionCompleted(object $session): void
    {
        if (($session->mode ?? null) !== 'subscription' || empty($session->subscription)) {
            return;
        }

        $subscriptionId = is_object($session->subscription)
            ? $session->subscription->id
            : $session->subscription;

        $userId = $session->metadata->user_id
            ?? $session->client_reference_id
            ?? null;

        if (! $userId) {
            Log::warning('checkout.session.completed missing user_id', [
                'session_id' => $session->id ?? null,
            ]);

            return;
        }

        $user = User::find($userId);
        if (! $user) {
            return;
        }

        if (! empty($session->customer) && empty($user->stripe_id)) {
            $customerId = is_object($session->customer) ? $session->customer->id : $session->customer;
            $user->forceFill(['stripe_id' => $customerId])->save();
        }

        // Prefer full subscription object sync when expanded; otherwise store stub until subscription.* events
        Subscription::updateOrCreate(
            ['stripe_id' => $subscriptionId],
            [
                'user_id' => $user->id,
                'type' => 'stripe',
                'stripe_status' => $session->payment_status === 'paid' ? 'active' : 'incomplete',
                'stripe_price' => $session->metadata->package_id
                    ? optional(Package::find($session->metadata->package_id))->stripe_price_id
                    : null,
                'quantity' => 1,
            ]
        );
    }

    protected function syncSubscription(object $sub): void
    {
        $userId = $sub->metadata->user_id ?? null;

        if (! $userId && ! empty($sub->customer)) {
            $customerId = is_object($sub->customer) ? $sub->customer->id : $sub->customer;
            $userId = optional(User::where('stripe_id', $customerId)->first())->id;
        }

        $existing = Subscription::where('stripe_id', $sub->id)->first();
        if (! $userId && $existing) {
            $userId = $existing->user_id;
        }

        if (! $userId) {
            Log::warning('Subscription event missing user mapping', ['stripe_id' => $sub->id]);

            return;
        }

        $priceId = $sub->items->data[0]->price->id ?? ($existing->stripe_price ?? null);

        Subscription::updateOrCreate(
            ['stripe_id' => $sub->id],
            [
                'user_id' => $userId,
                'type' => 'stripe',
                'stripe_status' => $sub->status,
                'stripe_price' => $priceId,
                'quantity' => $sub->quantity ?? 1,
                'trial_ends_at' => $sub->trial_end ? Carbon::createFromTimestamp($sub->trial_end) : null,
                'ends_at' => $sub->cancel_at ? Carbon::createFromTimestamp($sub->cancel_at) : null,
                'cancel_at_period_end' => (bool) ($sub->cancel_at_period_end ?? false),
            ]
        );
    }

    protected function handleSubscriptionDeleted(object $sub): void
    {
        $local = Subscription::where('stripe_id', $sub->id)->first();
        if ($local) {
            $local->update([
                'stripe_status' => 'canceled',
                'ends_at' => now(),
                'cancel_at_period_end' => false,
            ]);
        }
    }

    protected function handleInvoicePaymentSucceeded(object $invoice): void
    {
        if (empty($invoice->subscription)) {
            return;
        }

        $subscriptionId = is_object($invoice->subscription)
            ? $invoice->subscription->id
            : $invoice->subscription;

        $local = Subscription::where('stripe_id', $subscriptionId)->first();
        if ($local) {
            $local->update(['stripe_status' => 'active']);
        }
    }

    protected function handleInvoicePaymentFailed(object $invoice): void
    {
        if (empty($invoice->subscription)) {
            return;
        }

        $subscriptionId = is_object($invoice->subscription)
            ? $invoice->subscription->id
            : $invoice->subscription;

        $local = Subscription::where('stripe_id', $subscriptionId)->first();
        if ($local) {
            $local->update(['stripe_status' => 'past_due']);
        }
    }
}
