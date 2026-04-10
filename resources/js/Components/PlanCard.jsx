import { router } from '@inertiajs/react';

export default function PlanCard({ plan }) {
    const handleSubscribe = () => {
        router.post(`/subscribe/${plan.id}`);
    };

    return (
        <div>
            <h3>{plan.name}</h3>
            <p>${(plan.price_cents / 100).toFixed(2)} / {plan.interval}</p>
            <button onClick={handleSubscribe}>Subscribe</button>
        </div>
    );
}