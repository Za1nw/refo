<?php

use App\Support\Database\PreservesLegacySchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    use PreservesLegacySchema;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->createPreservedTable('languages', function (Blueprint $table) {
            $table->id();
            $table->string('key', 191);
            $table->text('value');
            $table->string('language', 10);
            $table->string('group', 100);
            $table->string('namespace', 100)->default('default');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['key', 'language', 'group', 'namespace'], 'unique_language_key');
            // indexes for faster lookups
            $table->index('language');
            $table->index('group');
            $table->index('namespace');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->rollbackPreservedSchema();
    }
};
