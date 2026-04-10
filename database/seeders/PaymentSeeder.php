<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            return;
        }

        // Create sample payments for the last 6 months
        for ($i = 0; $i < 20; $i++) {
            $date = Carbon::now()->subDays(rand(1, 180));
            
            Payment::create([
                'user_id' => $users->random()->id,
                'stripe_payment_intent_id' => 'pi_' . strtolower(Str::random(24)),
                'amount' => 19.00,
                'currency' => 'USD',
                'status' => 'succeeded',
                'payment_method' => 'card',
                'description' => 'Story Publishing Package - Sample Story ' . ($i + 1),
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
}
