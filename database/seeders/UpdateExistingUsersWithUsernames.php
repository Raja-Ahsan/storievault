<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\User;

class UpdateExistingUsersWithUsernames extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, add the username and full_name columns without unique constraint
        Schema::table('users', function ($table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'full_name')) {
                $table->string('full_name')->nullable()->after('username');
            }
        });

        // Update existing users with unique usernames
        $users = User::whereNull('username')->orWhere('username', '')->get();
        
        foreach ($users as $user) {
            $baseUsername = Str::slug($user->name);
            $username = $baseUsername;
            $counter = 1;
            
            // Ensure username is unique
            while (User::where('username', $username)->where('id', '!=', $user->id)->exists()) {
                $username = $baseUsername . '_' . $counter;
                $counter++;
            }
            
            $user->update([
                'username' => $username,
                'full_name' => $user->name // Set full_name to current name
            ]);
        }

        // Now add the unique constraint
        Schema::table('users', function ($table) {
            $table->string('username')->unique()->change();
        });
    }
}
