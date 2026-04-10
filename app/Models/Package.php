<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'badge',
        'price_cents',
        'words_limit',
        'stories_limit',
        'interval',
        'features',
        'stripe_price_id',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
    ];
}
