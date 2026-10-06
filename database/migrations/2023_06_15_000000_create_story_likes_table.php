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
        if (! Schema::hasTable('story_likes')) {
            Schema::create('story_likes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('story_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->timestamps();

                $table->unique(['story_id', 'user_id']);
            });
        }

        if (Schema::hasTable('stories') && ! Schema::hasColumn('stories', 'likes_count')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->integer('likes_count')->default(0);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('story_likes');

        if (Schema::hasTable('stories') && Schema::hasColumn('stories', 'likes_count')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->dropColumn('likes_count');
            });
        }
    }
};
