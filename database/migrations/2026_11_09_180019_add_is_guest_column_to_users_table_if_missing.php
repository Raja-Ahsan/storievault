<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Earlier is_guest migration was a no-op; ensure the column exists.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'is_guest')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_guest')->default(false)->after('remember_token');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'is_guest')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_guest');
            });
        }
    }
};
