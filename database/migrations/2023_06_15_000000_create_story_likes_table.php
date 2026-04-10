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
        Schema::create('story_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Add a unique constraint to prevent duplicate likes
            $table->unique(['story_id', 'user_id']);
        });
        
        // Add likes_count column to stories table
        Schema::table('stories', function (Blueprint $table) {
            $table->integer('likes_count')->default(0)->after('comment_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('story_likes');
        
        Schema::table('stories', function (Blueprint $table) {
            $table->dropColumn('likes_count');
        });
    }
};
