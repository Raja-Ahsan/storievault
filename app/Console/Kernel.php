<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
   

    protected function schedule(Schedule $schedule): void
    {
        // Reset comment counts daily at midnight
        $schedule->command('app:reset-comment-counts')->daily();

        // Sync read counts daily at 1 AM
        $schedule->command('app:sync-read-counts')->dailyAt('01:00');

        // Reset read counts weekly on Sunday at midnight (for demo purposes only)
        // In a real app, you would not reset read counts as they should reflect actual reads
        // $schedule->command('app:reset-read-counts')->weekly()->sundays()->at('00:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
