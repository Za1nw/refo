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
        if (! Schema::hasTable('languages')) {
            return;
        }

        Schema::table('languages', function (Blueprint $table): void {
            // Composite index for common lookup patterns
            $table->index(['language', 'namespace', 'group'], 'languages_lang_ns_group_idx');

            // Index on key for direct lookup
            $table->index('key', 'languages_key_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('languages')) {
            return;
        }

        Schema::table('languages', function (Blueprint $table): void {
            $table->dropIndex('languages_lang_ns_group_idx');
            $table->dropIndex('languages_key_idx');
        });
    }
};
