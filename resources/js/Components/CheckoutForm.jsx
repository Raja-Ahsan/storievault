import React, { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { router } from '@inertiajs/react';

const CheckoutForm = ({ packageId, onSuccess }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        // Fetch the client secret from the backend for SetupIntent
        fetch('/stripe/payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret))
            .catch((error) => {
                console.error('Error fetching payment intent:', error);
            });
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        // Create payment method
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (error) {
            console.error(error.message);
            setLoading(false);
        } else {
            // Send payment method and packageId to backend to create subscription
            fetch(`/subscribe/${packageId}`, {
                method: 'POST',
                body: JSON.stringify({
                    payment_method: paymentMethod.id,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Call onSuccess callback if provided, otherwise redirect
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.visit('/subscription-success');
                    }
                } else {
                    console.error(data.error);
                }
            })
            .catch(error => {
                console.error('Error processing subscription:', error);
            })
            .finally(() => {
                setLoading(false);
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe || loading}>
                {loading ? 'Processing...' : 'Subscribe'}
            </button>
        </form>
    );
};

export default CheckoutForm;
