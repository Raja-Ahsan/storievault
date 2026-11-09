<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Free packages intentionally have no Stripe Price — keep the column nullable.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->string('stripe_price_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->string('stripe_price_id')->nullable(false)->change();
        });
    }
};
