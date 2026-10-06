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
        if (! Schema::hasTable('stories')) {
            return;
        }

        if (! Schema::hasColumn('stories', 'likes_count')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->integer('likes_count')->default(0);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('stories') && Schema::hasColumn('stories', 'likes_count')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->dropColumn('likes_count');
            });
        }
    }
};
