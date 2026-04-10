<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\StoryLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoryLikesController extends Controller
{
    /**
     * Toggle like status for a story.
     */
    public function toggleLike(Story $story)
    {
        $user = Auth::user();
        
        // Check if the user has already liked this story
        $existingLike = StoryLike::where('story_id', $story->id)
            ->where('user_id', $user->id)
            ->first();
            
        if ($existingLike) {
            // User has already liked the story, so unlike it
            $existingLike->delete();
            
            // Decrement the likes count on the story
            $story->decrement('likes_count');
            
            $liked = false;
        } else {
            // User hasn't liked the story yet, so like it
            StoryLike::create([
                'story_id' => $story->id,
                'user_id' => $user->id,
            ]);
            
            // Increment the likes count on the story
            $story->increment('likes_count');
            
            $liked = true;
        }
        
        return response()->json([
            'success' => true,
            'liked' => $liked,
            'likes_count' => $story->fresh()->likes_count,
        ]);
    }
    
    /**
     * Check if the current user has liked a story.
     */
    public function checkLikeStatus(Story $story)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'liked' => false,
                'likes_count' => $story->likes_count,
            ]);
        }
        
        $liked = StoryLike::where('story_id', $story->id)
            ->where('user_id', $user->id)
            ->exists();
            
        return response()->json([
            'liked' => $liked,
            'likes_count' => $story->likes_count,
        ]);
    }
}
