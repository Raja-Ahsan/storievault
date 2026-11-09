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
        // categories is created later (2025_12_01_...); no-op on fresh installs.
        if (! Schema::hasTable('categories') || Schema::hasColumn('categories', 'faqs')) {
            return;
        }

        Schema::table('categories', function (Blueprint $table) {
            $table->json('faqs')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('categories') || ! Schema::hasColumn('categories', 'faqs')) {
            return;
        }

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('faqs');
        });
    }
};
