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
        Schema::create('translations', function (Blueprint $table) {
            $table->id();

            $table->morphs('translatable');

            $table->string('locale', 10);

            $table->string('field');

            $table->longText('value')->nullable();

            $table->timestamps();

            $table->unique([
                'translatable_type',
                'translatable_id',
                'locale',
                'field',
            ], 'translations_unique');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
