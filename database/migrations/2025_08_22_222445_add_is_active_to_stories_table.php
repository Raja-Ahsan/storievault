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
        if (! Schema::hasTable('stories') || Schema::hasColumn('stories', 'is_active')) {
            return;
        }

        Schema::table('stories', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('stories') || ! Schema::hasColumn('stories', 'is_active')) {
            return;
        }

        Schema::table('stories', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
