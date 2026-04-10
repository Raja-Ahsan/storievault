<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'publish_request_id',
        'stripe_payment_intent_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the user that made the payment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the publish request associated with the payment.
     */
    public function publishRequest()
    {
        return $this->belongsTo(PublishRequest::class);
    }
}
