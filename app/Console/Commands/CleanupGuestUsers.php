<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CleanupGuestUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-guest-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old guest users (older than 24 hours)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Cleaning up old guest users...');

        // Count guest users before cleanup
        $guestCountBefore = User::where('is_guest', true)->count();

        // Delete guest users older than 24 hours
        $deletedCount = User::where('is_guest', true)
            ->where('created_at', '<', now()->subHours(24))
            ->delete();

        $this->info("Cleaned up $deletedCount old guest users.");
        $this->info("Remaining guest users: " . ($guestCountBefore - $deletedCount));

        return Command::SUCCESS;
    }
} 