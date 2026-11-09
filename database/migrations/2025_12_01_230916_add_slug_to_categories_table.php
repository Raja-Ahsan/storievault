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
        if (! Schema::hasTable('categories')) {
            return;
        }

        // Check if slug column already exists
        if (! Schema::hasColumn('categories', 'slug')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('name');
            });
        }

        // Generate slugs for existing categories that don't have slugs
        $categories = \App\Models\Category::whereNull('slug')->orWhere('slug', '')->get();
        foreach ($categories as $category) {
            $category->slug = \Illuminate\Support\Str::slug($category->name);
            $category->save();
        }

        // Fresh installs already create slug as unique/not nullable.
        $slug = collect(Schema::getColumns('categories'))->firstWhere('name', 'slug');
        if ($slug && ($slug['nullable'] ?? false)) {
            Schema::table('categories', function (Blueprint $table) {
                $table->string('slug')->unique()->nullable(false)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('categories') || ! Schema::hasColumn('categories', 'slug')) {
            return;
        }

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
