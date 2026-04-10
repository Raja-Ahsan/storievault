<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Blog module tables. Uses blog_* names to avoid clashing with existing
     * `categories` (story/SEO categories) and future `posts` naming conflicts.
     */
    public function up(): void
    {
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('blog_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->text('excerpt')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_tags')->nullable();
            $table->string('facebook_meta')->nullable();
            $table->string('twitter_meta')->nullable();
            $table->enum('post_type', ['general'])->default('general');
            $table->boolean('featured')->default(false);
            $table->enum('visibility', ['public', 'private'])->default('public');
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->string('image')->nullable();
            $table->timestamps();
        });

        Schema::create('blog_category_post', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->foreignId('blog_category_id')->constrained('blog_categories')->cascadeOnDelete();
            $table->unique(['post_id', 'blog_category_id'], 'blog_category_post_unique');
        });

        Schema::create('blog_post_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->foreignId('blog_tag_id')->constrained('blog_tags')->cascadeOnDelete();
            $table->unique(['post_id', 'blog_tag_id'], 'blog_post_tag_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_post_tag');
        Schema::dropIfExists('blog_category_post');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('blog_tags');
        Schema::dropIfExists('blog_categories');
    }
};
