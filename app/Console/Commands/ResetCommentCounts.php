<?php

namespace App\Console\Commands;

use App\Models\Story;
use App\Models\Comment;
use Illuminate\Console\Command;

class ResetCommentCounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-comment-counts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset and recalculate comment counts for all stories';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Resetting comment counts...');

        // Get all stories
        $stories = Story::all();
        $bar = $this->output->createProgressBar(count($stories));
        $bar->start();

        foreach ($stories as $story) {
            // Count all comments for this story
            $commentCount = Comment::where('story_id', $story->id)->count();
            
            // Update the story with the correct count
            $story->comment_count = $commentCount;
            $story->save();
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Comment counts have been reset successfully!');
        
        return Command::SUCCESS;
    }
}
