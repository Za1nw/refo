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
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 255);
            $table->unsignedBigInteger('views')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->index('is_featured');
            $table->foreignId('category_id')->nullable()->index(); // ->constrained('blog_categories')
            // Audit
            $table->foreignId('created_by')->nullable()->index(); // ->constrained('users')
            $table->foreignId('updated_by')->nullable()->index(); // ->constrained('users')
            $table->foreignId('deleted_by')->nullable()->index(); // ->constrained('users')

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
