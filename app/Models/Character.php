<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Character extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'story_id',
        'description',
    ];

    /**
     * Get the story that the character belongs to.
     */
    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }
}
