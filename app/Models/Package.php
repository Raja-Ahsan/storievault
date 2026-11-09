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
        'stripe_account_id',
        'stripe_product_id',
        'is_active',
        'is_public',
        'invite_token',
        'discount_enabled',
        'discount_type',
        'discount_value',
        'discount_duration',
        'discount_duration_in_months',
        'discount_starts_at',
        'discount_ends_at',
        'stripe_coupon_id',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'discount_enabled' => 'boolean',
        'discount_value' => 'integer',
        'discount_duration_in_months' => 'integer',
        'discount_starts_at' => 'datetime',
        'discount_ends_at' => 'datetime',
        'price_cents' => 'integer',
    ];

    protected $appends = [
        'discount_active',
        'display_price_cents',
        'discount_badge',
        'renewal_price_cents',
        'renewal_note',
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

                // Free packages never carry paid discounts.
                $package->discount_enabled = false;
                $package->discount_type = null;
                $package->discount_value = null;
                $package->discount_duration = null;
                $package->discount_duration_in_months = null;
                $package->discount_starts_at = null;
                $package->discount_ends_at = null;
            } elseif ($package->is_public === null) {
                $package->is_public = true;
            }

            if (! $package->discount_enabled) {
                $package->discount_type = $package->discount_type ?: null;
                $package->discount_value = $package->discount_value ?: null;
                $package->discount_duration = $package->discount_duration ?: null;
                $package->discount_duration_in_months = null;
            }

            if ($package->discount_duration !== 'repeating') {
                $package->discount_duration_in_months = null;
            }
        });
    }

    public function scopePubliclyListed($query)
    {
        return $query->where('is_active', true)->where('is_public', true);
    }

    /**
     * Packages created under a specific Stripe account (acct_…).
     */
    public function scopeForStripeAccount($query, string $accountId)
    {
        return $query->where('stripe_account_id', $accountId);
    }

    public function inviteUrl(): ?string
    {
        if (! $this->invite_token) {
            return null;
        }

        return url('/packages/invite/'.$this->invite_token);
    }

    public function hasActiveDiscountWindow(): bool
    {
        if (! $this->discount_enabled) {
            return false;
        }

        if (! in_array($this->discount_type, ['percentage', 'fixed'], true)) {
            return false;
        }

        if ((int) $this->discount_value <= 0) {
            return false;
        }

        if (! in_array($this->discount_duration, ['once', 'repeating', 'forever'], true)) {
            return false;
        }

        if ($this->discount_duration === 'repeating' && (int) $this->discount_duration_in_months < 1) {
            return false;
        }

        $now = now();

        if ($this->discount_starts_at && $now->lt($this->discount_starts_at)) {
            return false;
        }

        if ($this->discount_ends_at && $now->gt($this->discount_ends_at)) {
            return false;
        }

        return true;
    }

    public function shouldApplyDiscountAtCheckout(): bool
    {
        return $this->hasActiveDiscountWindow()
            && ! empty($this->stripe_coupon_id)
            && (int) ($this->price_cents ?? 0) > 0;
    }

    public function discountedPriceCents(): int
    {
        $price = (int) ($this->price_cents ?? 0);

        if (! $this->hasActiveDiscountWindow() || $price <= 0) {
            return $price;
        }

        if ($this->discount_type === 'percentage') {
            $pct = min(100, max(0, (int) $this->discount_value));
            $discounted = (int) round($price * (1 - ($pct / 100)));
        } else {
            $discounted = $price - (int) $this->discount_value;
        }

        return max(0, $discounted);
    }

    public function getDiscountActiveAttribute(): bool
    {
        return $this->hasActiveDiscountWindow();
    }

    public function getDisplayPriceCentsAttribute(): int
    {
        return $this->hasActiveDiscountWindow()
            ? $this->discountedPriceCents()
            : (int) ($this->price_cents ?? 0);
    }

    public function getDiscountBadgeAttribute(): ?string
    {
        if (! $this->hasActiveDiscountWindow()) {
            return null;
        }

        if ($this->discount_type === 'percentage') {
            return ((int) $this->discount_value).'% OFF';
        }

        $dollars = number_format(((int) $this->discount_value) / 100, 2);

        return '$'.$dollars.' OFF';
    }

    public function getRenewalPriceCentsAttribute(): int
    {
        return (int) ($this->price_cents ?? 0);
    }

    public function getRenewalNoteAttribute(): ?string
    {
        if (! $this->hasActiveDiscountWindow()) {
            return null;
        }

        $full = '$'.number_format($this->renewal_price_cents / 100, 2);
        $interval = $this->interval ? ' / '.$this->interval : '';

        return match ($this->discount_duration) {
            'once' => "First billing only — then {$full}{$interval}",
            'repeating' => 'Discount for '.(int) $this->discount_duration_in_months
                .' billing cycle(s) — then '.$full.$interval,
            'forever' => 'Discount applies for the life of the subscription',
            default => null,
        };
    }
}
