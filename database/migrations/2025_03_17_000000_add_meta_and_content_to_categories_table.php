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
        if (! Schema::hasTable('categories')) {
            return;
        }

        $columns = [
            'meta_title' => fn (Blueprint $table) => $table->string('meta_title')->nullable(),
            'meta_description' => fn (Blueprint $table) => $table->string('meta_description', 512)->nullable(),
            'content' => fn (Blueprint $table) => $table->longText('content')->nullable(),
        ];

        foreach ($columns as $name => $definition) {
            if (! Schema::hasColumn('categories', $name)) {
                Schema::table('categories', $definition);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        $columns = array_values(array_filter(
            ['meta_title', 'meta_description', 'content'],
            fn (string $column) => Schema::hasColumn('categories', $column)
        ));

        if ($columns !== []) {
            Schema::table('categories', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};
