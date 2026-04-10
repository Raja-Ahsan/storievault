<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublishPackage extends Model
{
    protected $fillable = [
        'name',
        'price',
        'features',
        'stripe_price_id',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
    ];
}
