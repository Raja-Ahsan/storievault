<?php

namespace Tests\Feature;

use App\Models\StripeEvent;
use App\Models\Subscription;
use App\Models\User;
use Tests\Support\CreatesStripeTestSchema;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use CreatesStripeTestSchema;

    protected string $webhookSecret = 'whsec_test_secret_for_automated_tests';

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpStripeSchema();
        config(['services.stripe.webhook_secret' => $this->webhookSecret]);
    }

    protected function signedPayload(array $event): array
    {
        $payload = json_encode($event);
        $timestamp = time();
        $signedPayload = $timestamp.'.'.$payload;
        $signature = hash_hmac('sha256', $signedPayload, $this->webhookSecret);

        return [
            'payload' => $payload,
            'header' => "t={$timestamp},v1={$signature}",
        ];
    }

    public function test_invalid_webhook_signature_is_rejected(): void
    {
        $response = $this->call(
            'POST',
            '/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => 't=1,v1=invalid',
            ],
            json_encode(['id' => 'evt_1', 'type' => 'invoice.payment_succeeded', 'data' => ['object' => []]])
        );

        $response->assertStatus(400);
    }

    public function test_successful_subscription_activation_from_webhook(): void
    {
        $user = User::factory()->create(['stripe_id' => 'cus_test_1']);

        $event = [
            'id' => 'evt_test_sub_created',
            'object' => 'event',
            'type' => 'customer.subscription.created',
            'data' => [
                'object' => [
                    'id' => 'sub_test_abc',
                    'object' => 'subscription',
                    'status' => 'active',
                    'customer' => 'cus_test_1',
                    'cancel_at_period_end' => false,
                    'trial_end' => null,
                    'cancel_at' => null,
                    'quantity' => 1,
                    'metadata' => [
                        'user_id' => (string) $user->id,
                    ],
                    'items' => [
                        'data' => [
                            [
                                'price' => ['id' => 'price_test_standard_monthly'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $signed = $this->signedPayload($event);

        $response = $this->call(
            'POST',
            '/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => $signed['header'],
            ],
            $signed['payload']
        );

        $response->assertOk();
        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'stripe_id' => 'sub_test_abc',
            'stripe_status' => 'active',
            'stripe_price' => 'price_test_standard_monthly',
        ]);
        $this->assertDatabaseHas('stripe_events', [
            'event_id' => 'evt_test_sub_created',
            'type' => 'customer.subscription.created',
        ]);
    }

    public function test_duplicate_webhook_delivery_is_idempotent(): void
    {
        $user = User::factory()->create();

        $event = [
            'id' => 'evt_test_duplicate',
            'object' => 'event',
            'type' => 'invoice.payment_succeeded',
            'data' => [
                'object' => [
                    'id' => 'in_test_1',
                    'subscription' => 'sub_dup',
                ],
            ],
        ];

        Subscription::create([
            'user_id' => $user->id,
            'type' => 'stripe',
            'stripe_id' => 'sub_dup',
            'stripe_status' => 'past_due',
            'stripe_price' => 'price_test',
            'quantity' => 1,
        ]);

        $signed = $this->signedPayload($event);

        $first = $this->call(
            'POST',
            '/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => $signed['header'],
            ],
            $signed['payload']
        );
        $first->assertOk();

        $second = $this->call(
            'POST',
            '/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => $signed['header'],
            ],
            $signed['payload']
        );
        $second->assertOk();
        $second->assertSee('Duplicate');

        $this->assertEquals(1, StripeEvent::where('event_id', 'evt_test_duplicate')->count());
        $this->assertDatabaseHas('subscriptions', [
            'stripe_id' => 'sub_dup',
            'stripe_status' => 'active',
        ]);
    }

    public function test_failed_payment_marks_subscription_past_due(): void
    {
        $user = User::factory()->create();
        Subscription::create([
            'user_id' => $user->id,
            'type' => 'stripe',
            'stripe_id' => 'sub_fail',
            'stripe_status' => 'active',
            'stripe_price' => 'price_test',
            'quantity' => 1,
        ]);

        $event = [
            'id' => 'evt_payment_failed',
            'object' => 'event',
            'type' => 'invoice.payment_failed',
            'data' => [
                'object' => [
                    'id' => 'in_fail',
                    'subscription' => 'sub_fail',
                ],
            ],
        ];

        $signed = $this->signedPayload($event);

        $this->call(
            'POST',
            '/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => $signed['header'],
            ],
            $signed['payload']
        )->assertOk();

        $this->assertDatabaseHas('subscriptions', [
            'stripe_id' => 'sub_fail',
            'stripe_status' => 'past_due',
        ]);
    }

    public function test_checkout_session_completed_activates_subscription(): void
    {
        $user = User::factory()->create();

        $event = [
            'id' => 'evt_cs_completed',
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_1',
                    'mode' => 'subscription',
                    'payment_status' => 'paid',
                    'subscription' => 'sub_from_checkout',
                    'customer' => 'cus_from_checkout',
                    'client_reference_id' => (string) $user->id,
                    'metadata' => [
                        'user_id' => (string) $user->id,
                        'package_id' => '6',
                    ],
                ],
            ],
        ];

        $signed = $this->signedPayload($event);

        $this->call(
            'POST',
            '/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => $signed['header'],
            ],
            $signed['payload']
        )->assertOk();

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'stripe_id' => 'sub_from_checkout',
            'stripe_status' => 'active',
        ]);

        $user->refresh();
        $this->assertEquals('cus_from_checkout', $user->stripe_id);
    }
}
