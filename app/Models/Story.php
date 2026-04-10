<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Story extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'author',
        'genre',
        'cover_image',
        'backcover_image',
        'read_count',
        'comment_count',
        'likes_count',
        'style',
        'content',
        'is_community',
        'status',
        'user_id',
        'rating_id',
    ];

    /**
     * The attributes that should have default values.
     *
     * @var array
     */
    protected $attributes = [
        'is_community' => false,
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }


    public function rating() {
        return $this->belongsTo(Rating::class, 'rating_id');
    }

    public function scopeCommunity($query)
    {
        return $query->where('is_community', true);
    }

    public function scopeStandard($query)
    {
        return $query->where('is_community', false);
    }

    /**
     * Get the characters for the story.
     */
    public function characters(): HasMany
    {
        return $this->hasMany(Character::class);
    }

    /**
     * Get the comments for the story.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the reads for the story.
     */
    public function reads(): HasMany
    {
        return $this->hasMany(StoryRead::class);
    }

    /**
     * Get the likes for the story.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(StoryLike::class);
    }

    /**
     * Get the ratings for the story.
     */
    public function storyRatings(): HasMany
    {
        return $this->hasMany(StoryRating::class);
    }

    /**
     * Get the users who liked the story.
     */
    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'story_likes')
            ->withTimestamps();
    }

    /**
     * Get the drafts for the story.
     */
    public function drafts(): HasMany
    {
        return $this->hasMany(StoryDraft::class);
    }

    public static function monthlyCountsByType($type = 'community', $year = null)
    {
        $year = $year ?? now()->year;

        $query = self::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', $year)
            ->groupBy('month');

        if ($type === 'community') {
            $query->community();
        } else {
            $query->standard();
        }

        $stories = $query->get()->keyBy('month');

        return collect(range(1, 12))->map(function ($month) use ($stories) {
            return [
                'month' => \Carbon\Carbon::create()->month($month)->format('M'),
                'count' => $stories[$month]->count ?? 0,
            ];
        });
    }

    protected $appends = ['created_at_formatted', 'cover_image_url', 'backcover_image_url'];

    public function getCreatedAtFormattedAttribute()
    {
        return $this->created_at ? $this->created_at->format('d M Y') : 'N/A';
    }

    public static function getGenres()
    {
        return self::whereNotNull('genre')->distinct()->pluck('genre');
    }

    public static function getRatings()
    {
        return Rating::orderBy('name')->get();
    }

    


    public function scopeFilter($query, $filters)
    {
        if (!empty($filters['genre']) && $filters['genre'] !== 'all') {
            $query->where('genre', $filters['genre']);
        }

        if (!empty($filters['rating']) && $filters['rating'] !== 'all') {
            $query->where('rating_id', $filters['rating']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}")
                    ->orWhere('description', 'like', "%{$filters['search']}%")
                    ->orWhere('author', 'like', "%{$filters['search']}%");
            });
        }
        return $query;
    }

    /**
     * Get the URL for the cover image.
     */
    public function getCoverImageUrlAttribute()
    {
        if (!$this->cover_image) {
            return null;
        }
        // Use relative URL to avoid APP_URL issues
        return '/storage/' . $this->cover_image;
    }

    /**
     * Get the URL for the back cover image.
     */
    public function getBackcoverImageUrlAttribute()
    {
        if (!$this->backcover_image) {
            return null;
        }
        // Use relative URL to avoid APP_URL issues
        return '/storage/' . $this->backcover_image;
    }
}
