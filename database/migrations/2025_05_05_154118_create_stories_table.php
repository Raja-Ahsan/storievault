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
        if (!Schema::hasTable('stories')) {
            Schema::create('stories', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description');
                $table->string('author');
                $table->string('genre');
                $table->string('cover_image');
                $table->integer('read_count')->default(0);
                $table->integer('comment_count')->default(0);
                $table->string('style')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
