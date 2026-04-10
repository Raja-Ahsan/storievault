<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\StoryRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoryRatingsController extends Controller
{
    /**
     * Store or update rating for a story.
     */
    public function store(Story $story, Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to rate a story.',
            ], 401);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        // Check if the user has already rated this story
        $existingRating = StoryRating::where('story_id', $story->id)
            ->where('user_id', $user->id)
            ->first();
            
        if ($existingRating) {
            // Update existing rating
            $existingRating->update([
                'rating' => $request->rating,
            ]);
        } else {
            // Create new rating
            StoryRating::create([
                'story_id' => $story->id,
                'user_id' => $user->id,
                'rating' => $request->rating,
            ]);
        }

        // Calculate average rating
        $average = StoryRating::where('story_id', $story->id)->avg('rating');
        
        return response()->json([
            'success' => true,
            'message' => 'Rating submitted successfully',
            'average_rating' => number_format($average, 1),
            'user_rating' => $request->rating,
        ]);
    }

    /**
     * Get rating status for a story.
     */
    public function getRating(Story $story)
    {
        $user = Auth::user();
        
        $userRating = null;
        if ($user) {
            $rating = StoryRating::where('story_id', $story->id)
                ->where('user_id', $user->id)
                ->first();
            $userRating = $rating ? $rating->rating : null;
        }

        // Calculate average rating
        $average = StoryRating::where('story_id', $story->id)->avg('rating');
        
        return response()->json([
            'user_rating' => $userRating,
            'average_rating' => $average ? number_format($average, 1) : null,
        ]);
    }
}
