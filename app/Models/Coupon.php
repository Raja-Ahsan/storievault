<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['user_id', 'code', 'discount', 'is_used'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
