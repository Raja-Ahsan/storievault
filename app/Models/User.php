<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'full_name',
        'email',
        'password',
        'role',
        'is_guest',
        'is_active',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_guest' => 'boolean',
            'role' => 'string',
        ];
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
    public function isUser()
    {
        return $this->role === 'user';
    }
    public function isGuest()
    {
        return $this->role === 'guest';
    }

    /**
     * Get the comments for the user.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the story likes for the user.
     */
    public function storyLikes(): HasMany
    {
        return $this->hasMany(StoryLike::class);
    }

    /**
     * Get the stories that the user has liked.
     */
    public function likedStories(): BelongsToMany
    {
        return $this->belongsToMany(Story::class, 'story_likes')
            ->withTimestamps();
    }

    /**
     * Get the story drafts for the user.
     */
    public function storyDrafts(): HasMany
    {
        return $this->hasMany(StoryDraft::class);
    }

    public static function monthlyRegistrations($year = null)
    {
        $year = $year ?? now()->year;

        $users = self::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        return collect(range(1, 12))->map(function ($month) use ($users) {
            return [
                'month' => \Carbon\Carbon::create()->month($month)->format('M'),
                'count' => $users[$month]->count ?? 0,
            ];
        });
    }

    public function subscription() {
        return $this->hasOne(Subscription::class)->with('package');
    }

    public function stories() {
        return $this->hasMany(Story::class);
    }
}
