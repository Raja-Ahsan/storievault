<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Subscription;
use App\Models\StripeEvent;
use Stripe\Webhook;
use Carbon\Carbon;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload    = $request->getContent();
        $sigHeader  = $request->header('Stripe-Signature');
        $secret     = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Stripe Webhook invalid payload');
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe Webhook invalid signature');
            return response('Invalid signature', 400);
        }

        // 🔒 Idempotency guard
        if (StripeEvent::where('event_id', $event->id)->exists()) {
            Log::info("Stripe event {$event->id} already processed");
            return response('Duplicate', 200);
        }

        try {
            switch ($event->type) {
                case 'invoice.payment_succeeded':
                    $invoice = $event->data->object;
                    Log::info("Invoice payment succeeded: {$invoice->id}");

                    if ($invoice->subscription) {
                        $local = Subscription::where('stripe_id', $invoice->subscription)->first();
                        if ($local) {
                            $local->update(['stripe_status' => 'active']);
                            Log::info("Subscription {$invoice->subscription} set to active");
                        }
                    }
                    break;

                case 'invoice.payment_failed':
                    $invoice = $event->data->object;
                    Log::warning("Invoice payment failed: {$invoice->id}");

                    if ($invoice->subscription) {
                        $local = Subscription::where('stripe_id', $invoice->subscription)->first();
                        if ($local) {
                            $local->update(['stripe_status' => 'past_due']);
                            Log::warning("Subscription {$invoice->subscription} marked as past_due");
                        }
                    }
                    break;

                    case 'customer.subscription.created':
                        case 'customer.subscription.updated':
                        case 'customer.subscription.deleted':
                            $sub = $event->data->object; // \Stripe\Subscription
                            Log::info("Subscription event: {$event->type} for {$sub->id}");
                        
                            Subscription::updateOrCreate(
                                ['stripe_id' => $sub->id],
                                [
                                    'user_id'       => $sub->metadata->user_id ?? null, // Agar tum metadata me user_id bhej rahe ho
                                    'type'          => 'default',
                                    'stripe_status' => $sub->status,
                                    'trial_ends_at' => $sub->trial_end ? Carbon::createFromTimestamp($sub->trial_end) : null,
                                    'ends_at'       => $sub->cancel_at ? Carbon::createFromTimestamp($sub->cancel_at) : null,
                                    'cancel_at_period_end' => $sub->cancel_at_period_end,
                                ]
                            );
                        
                            Log::info("Local subscription {$sub->id} synced: status {$sub->status}");
                            break;

                default:
                    Log::info("Unhandled Stripe event: {$event->type}");
                    break;
            }

            // ✅ Mark event as processed
            StripeEvent::create([
                'event_id' => $event->id,
                'type'     => $event->type,
            ]);
        } catch (\Throwable $e) {
            Log::error("Stripe webhook error: ".$e->getMessage(), ['event' => $event->type]);
            return response('Webhook handling error', 500);
        }

        return response('OK', 200);
    }
}
