<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoryRating extends Model
{
    use HasFactory;

    protected $table = 'story_ratings';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'story_id',
        'user_id',
        'rating',
    ];

    /**
     * Get the story that was rated.
     */
    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }

    /**
     * Get the user who rated the story.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
