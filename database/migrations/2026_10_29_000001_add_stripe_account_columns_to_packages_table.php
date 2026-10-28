<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            if (! Schema::hasColumn('packages', 'stripe_account_id')) {
                $table->string('stripe_account_id')->nullable()->index()->after('stripe_price_id');
            }
            if (! Schema::hasColumn('packages', 'stripe_product_id')) {
                $table->string('stripe_product_id')->nullable()->index()->after('stripe_account_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            if (Schema::hasColumn('packages', 'stripe_product_id')) {
                $table->dropColumn('stripe_product_id');
            }
            if (Schema::hasColumn('packages', 'stripe_account_id')) {
                $table->dropColumn('stripe_account_id');
            }
        });
    }
};
