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
        Schema::create('writing_character', function (Blueprint $table) {
            $table->id();
            $table->text('content');
            $table->enum('status', ['draft', 'publish'])->default('draft');
            $table->foreignId('story_id')->constrained()->onDelete('cascade');
            $table->foreignId('character_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_character');
    }
};
