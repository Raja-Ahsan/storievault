<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Post extends Model implements HasMedia
{
    use HasSlug;
    use InteractsWithMedia;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'meta_title',
        'meta_description',
        'meta_tags',
        'facebook_meta',
        'twitter_meta',
        'post_type',
        'featured',
        'visibility',
        'status',
        'scheduled_publish_at',
        'faqs',
        'image',
    ];

    protected $appends = [
        'featured_image',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'media',
    ];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'scheduled_publish_at' => 'datetime',
            'faqs' => 'array',
        ];
    }

    /**
     * Public blog listing / detail: published, public, and not before scheduled time.
     */
    public function scopePubliclyVisible(Builder $query): void
    {
        $query->where('status', 'published')
            ->where('visibility', 'public')
            ->where(function (Builder $q) {
                $q->whereNull('scheduled_publish_at')
                    ->orWhere('scheduled_publish_at', '<=', now());
            });
    }

    public function isScheduledForFuture(): bool
    {
        if ($this->status !== 'published' || ! $this->scheduled_publish_at) {
            return false;
        }

        return $this->scheduled_publish_at->isFuture();
    }

    public function getFeaturedImageAttribute(): ?string
    {
        $media = $this->getFirstMedia('posts');
        if (! $media) {
            return null;
        }

        if ($media->disk !== 'public') {
            return $media->getFullUrl();
        }

        $relative = ltrim(str_replace('\\', '/', $media->getPathRelativeToRoot()), '/');

        // Use asset() so the URL matches the current request host (127.0.0.1 vs localhost, etc.)
        return asset('storage/'.$relative);
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('posts')
            ->singleFile()
            ->useDisk('public');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(BlogCategory::class, 'blog_category_post', 'post_id', 'blog_category_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(BlogTag::class, 'blog_post_tag', 'post_id', 'blog_tag_id');
    }

    public function featuredImageUrl(): ?string
    {
        return $this->featured_image;
    }
}
