<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
        'is_public',
        'invite_token',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saving(function (Package $package) {
            $isFree = empty($package->price_cents) || (int) $package->price_cents === 0;

            if ($isFree) {
                $package->is_public = false;
                if (empty($package->invite_token)) {
                    $package->invite_token = Str::random(40);
                }
            } elseif ($package->is_public === null) {
                $package->is_public = true;
            }
        });
    }

    public function scopePubliclyListed($query)
    {
        return $query->where('is_active', true)->where('is_public', true);
    }

    public function inviteUrl(): ?string
    {
        if (! $this->invite_token) {
            return null;
        }

        return url('/packages/invite/' . $this->invite_token);
    }
}
