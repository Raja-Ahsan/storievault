<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Early stub so 2023 story-related migrations can run before the 2025 create_stories migrations.
 * Safe no-op when stories already exists (production).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('stories')) {
            return;
        }

        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('author')->nullable();
            $table->string('genre')->nullable();
            $table->string('cover_image')->nullable();
            $table->integer('read_count')->default(0);
            $table->integer('comment_count')->default(0);
            $table->string('style')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Intentionally empty — later create_stories migrations own the table lifecycle.
    }
};
