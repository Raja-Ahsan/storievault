<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            if (! Schema::hasColumn('packages', 'discount_enabled')) {
                $table->boolean('discount_enabled')->default(false)->after('invite_token');
            }
            if (! Schema::hasColumn('packages', 'discount_type')) {
                $table->string('discount_type', 20)->nullable()->after('discount_enabled');
            }
            if (! Schema::hasColumn('packages', 'discount_value')) {
                $table->unsignedInteger('discount_value')->nullable()->after('discount_type');
            }
            if (! Schema::hasColumn('packages', 'discount_duration')) {
                $table->string('discount_duration', 20)->nullable()->after('discount_value');
            }
            if (! Schema::hasColumn('packages', 'discount_duration_in_months')) {
                $table->unsignedInteger('discount_duration_in_months')->nullable()->after('discount_duration');
            }
            if (! Schema::hasColumn('packages', 'discount_starts_at')) {
                $table->timestamp('discount_starts_at')->nullable()->after('discount_duration_in_months');
            }
            if (! Schema::hasColumn('packages', 'discount_ends_at')) {
                $table->timestamp('discount_ends_at')->nullable()->after('discount_starts_at');
            }
            if (! Schema::hasColumn('packages', 'stripe_coupon_id')) {
                $table->string('stripe_coupon_id')->nullable()->index()->after('discount_ends_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $columns = [
                'discount_enabled',
                'discount_type',
                'discount_value',
                'discount_duration',
                'discount_duration_in_months',
                'discount_starts_at',
                'discount_ends_at',
                'stripe_coupon_id',
            ];

            $existing = array_values(array_filter(
                $columns,
                fn (string $column) => Schema::hasColumn('packages', $column)
            ));

            if ($existing !== []) {
                $table->dropColumn($existing);
            }
        });
    }
};
