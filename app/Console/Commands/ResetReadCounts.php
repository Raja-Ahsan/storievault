<?php

namespace App\Console\Commands;

use App\Models\Story;
use Illuminate\Console\Command;

class ResetReadCounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-read-counts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset read counts for all stories';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Resetting read counts...');

        // Get all stories
        $stories = Story::all();
        $bar = $this->output->createProgressBar(count($stories));
        $bar->start();

        foreach ($stories as $story) {
            // Set a random read count between 10 and 100 for testing purposes
            // In a real application, you might want to keep the existing counts
            // or implement a more sophisticated algorithm
            $story->read_count = rand(10, 100);
            $story->save();
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Read counts have been reset successfully!');
        
        return Command::SUCCESS;
    }
}
