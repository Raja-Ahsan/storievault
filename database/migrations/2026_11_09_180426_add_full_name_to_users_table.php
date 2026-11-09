<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'full_name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('full_name')->nullable()->after('name');
            });
        }

        DB::table('users')
            ->whereNull('full_name')
            ->orWhere('full_name', '')
            ->update(['full_name' => DB::raw('name')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'full_name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('full_name');
            });
        }
    }
};
