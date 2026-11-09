<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the default admin account.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin',
                'username' => 'admin',
                'password' => 'Admin@123',
                'role' => 'admin',
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
