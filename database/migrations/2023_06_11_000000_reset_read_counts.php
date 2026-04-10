<?php

use App\Models\Story;
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
        // Reset all read counts to a random number between 10 and 100
        // This is just for initial data to make it look realistic
        $stories = Story::all();
        foreach ($stories as $story) {
            $story->read_count = rand(10, 100);
            $story->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to do anything in down() as we're just setting initial data
    }
};
