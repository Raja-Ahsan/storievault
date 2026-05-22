<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'meta_title',
        'meta_description',
        'content',
        'faqs',
    ];

    protected $casts = [
        'faqs' => 'array',
    ];
}
