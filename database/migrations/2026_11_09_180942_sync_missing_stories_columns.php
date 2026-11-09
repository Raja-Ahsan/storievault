<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fresh installs create stories via the early stub, then later create_* migrations
 * no-op because the table already exists — so app columns like user_id / is_active
 * were never added. Backfill them here.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('stories')) {
            return;
        }

        if (! Schema::hasColumn('stories', 'user_id')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasColumn('stories', 'is_active')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('status');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('stories')) {
            return;
        }

        if (Schema::hasColumn('stories', 'user_id')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->dropConstrainedForeignId('user_id');
            });
        }

        if (Schema::hasColumn('stories', 'is_active')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
