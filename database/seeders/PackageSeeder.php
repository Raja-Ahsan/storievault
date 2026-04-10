<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing packages
        Package::truncate();

        Package::create([
            'name' => 'Free',
            'price_cents' => 0,
            'words_limit' => 0,
            'stories_limit' => 0,
            'interval' => null,
            'features' => [
                'Can read all published stories',
                'Cannot write, publish, or contribute to stories',
                'Cannot read community stories',
                'Do not need to login as a guest account'
            ],
            'stripe_price_id' => null,
            'is_active' => true,
        ]);

        Package::create([
            'name' => 'Standard',
            'price_cents' => 1900, // $19.00
            'words_limit' => 300,
            'stories_limit' => 5,
            'interval' => 'monthly',
            'features' => [
                'Can write 300 words per day',
                'Can read community stories',
                'Users are allowed to write up to 300 words per day',
                'Users can post 5 community stories per month'
            ],
            'stripe_price_id' => 'price_standard_monthly',
            'is_active' => true,
        ]);

        Package::create([
            'name' => 'Premium',
            'price_cents' => 3800, // $38.00
            'words_limit' => 600,
            'stories_limit' => 10,
            'interval' => 'monthly',
            'features' => [
                'Can write 600 words per day',
                'Can read community stories',
                'Users are allowed to write up to 600 words per day',
                'Users can post 10 community stories per month'
            ],
            'stripe_price_id' => 'price_premium_monthly',
            'is_active' => true,
        ]);

        Package::create([
            'name' => 'Pro',
            'price_cents' => 19000, // $190.00
            'words_limit' => 300,
            'stories_limit' => 5,
            'interval' => 'yearly',
            'features' => [
                'Can write 300 words per day',
                'Can read community stories',
                'Users are allowed to write up to 300 words per day',
                'Users can post 5 community stories per month',
                'Save 17% compared to monthly billing'
            ],
            'stripe_price_id' => 'price_pro_yearly',
            'is_active' => true,
        ]);

        Package::create([
            'name' => 'Pro Premium',
            'price_cents' => 38000, // $380.00
            'words_limit' => 600,
            'stories_limit' => 10,
            'interval' => 'yearly',
            'features' => [
                'Can write 600 words per day',
                'Can read community stories',
                'Users are allowed to write up to 600 words per day',
                'Users can post 10 community stories per month',
                'Save 17% compared to monthly billing'
            ],
            'stripe_price_id' => 'price_pro_premium_yearly',
            'is_active' => true,
        ]);
    }
}
