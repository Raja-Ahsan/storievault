<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class FixGuestUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-guest-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix existing guest users by setting is_active to false';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing guest users...');

        // Count guest users before fix
        $guestCount = User::where('is_guest', true)->count();
        $activeGuestCount = User::where('is_guest', true)->where('is_active', true)->count();

        $this->info("Found $guestCount guest users, $activeGuestCount are currently active.");

        // Fix guest users by setting is_active to false
        $updatedCount = User::where('is_guest', true)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        $this->info("Fixed $updatedCount guest users by setting is_active to false.");

        // Clean up old guest users
        $deletedCount = User::where('is_guest', true)
            ->where('created_at', '<', now()->subHours(24))
            ->delete();

        $this->info("Deleted $deletedCount old guest users (older than 24 hours).");

        return Command::SUCCESS;
    }
} 