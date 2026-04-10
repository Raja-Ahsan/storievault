<?php

use App\Models\Story;
use App\Models\Comment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, reset all comment counts to 0
        DB::table('stories')->update(['comment_count' => 0]);

        // Then, update each story with the correct comment count
        $stories = Story::all();
        foreach ($stories as $story) {
            // Count all comments for this story (including replies)
            $commentCount = Comment::where('story_id', $story->id)->count();
            
            // Update the story with the correct count
            $story->comment_count = $commentCount;
            $story->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to do anything in down() as we're just correcting data
    }
};
