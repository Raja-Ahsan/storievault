<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Safe for live DBs where story_drafts.character_id FK may already exist
     * (e.g. created manually or by an earlier schema state).
     */
    public function up(): void
    {
        if (! Schema::hasTable('story_drafts') || ! Schema::hasTable('characters')) {
            return;
        }

        if (! Schema::hasColumn('story_drafts', 'character_id')) {
            return;
        }

        if ($this->foreignKeyExists('story_drafts', 'story_drafts_character_id_foreign')) {
            return;
        }

        Schema::table('story_drafts', function (Blueprint $table) {
            $table->foreign('character_id')
                ->references('id')
                ->on('characters')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('story_drafts')) {
            return;
        }

        if (! $this->foreignKeyExists('story_drafts', 'story_drafts_character_id_foreign')) {
            return;
        }

        Schema::table('story_drafts', function (Blueprint $table) {
            $table->dropForeign(['character_id']);
        });
    }

    protected function foreignKeyExists(string $table, string $constraintName): bool
    {
        $database = DB::getDatabaseName();

        $result = DB::selectOne(
            'SELECT CONSTRAINT_NAME
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE CONSTRAINT_SCHEMA = ?
               AND TABLE_NAME = ?
               AND CONSTRAINT_TYPE = ?
               AND CONSTRAINT_NAME = ?
             LIMIT 1',
            [$database, $table, 'FOREIGN KEY', $constraintName]
        );

        return $result !== null;
    }
};
