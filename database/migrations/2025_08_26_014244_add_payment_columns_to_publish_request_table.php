<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('publish_request', function (Blueprint $table) {
            $table->string('payment_status')->default('pending')->after('status');
            $table->string('stripe_session_id')->nullable()->after('payment_status');
            $table->timestamp('paid_at')->nullable()->after('stripe_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publish_request', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'stripe_session_id', 'paid_at']);
        });
    }
};
