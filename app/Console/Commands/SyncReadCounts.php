<?php

namespace App\Console\Commands;

use App\Models\Story;
use App\Models\StoryRead;
use Illuminate\Console\Command;

class SyncReadCounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-read-counts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize read counts for all stories based on actual reads';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Synchronizing read counts...');

        // Get all stories
        $stories = Story::all();
        $bar = $this->output->createProgressBar(count($stories));
        $bar->start();

        $updated = 0;

        foreach ($stories as $story) {
            // Count actual reads from the story_reads table
            $actualReadCount = StoryRead::where('story_id', $story->id)->count();

            // Update the story's read_count if it doesn't match the actual count
            if ($story->read_count != $actualReadCount) {
                $story->read_count = $actualReadCount;
                $story->save();
                $updated++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Read counts have been synchronized. Updated $updated stories.");

        return Command::SUCCESS;
    }
}
