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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();

            $table->string('scope')->index();
            // مثال: admin_sidebar | admin_topbar | customer_sidebar

            $table->string('type')->default('link');
            // link | group | header | divider

            $table->string('title');
            $table->string('short_title')->nullable();
            $table->string('icon')->nullable();

            $table->boolean('is_route')->default(true);
            $table->string('route_name')->nullable();
            $table->string('url')->nullable();

            $table->json('active_patterns')->nullable();

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('menu_items')
                ->nullOnDelete();

            $table->unsignedInteger('sort')->default(0);

            $table->boolean('status')->default(true);
            $table->boolean('is_disabled')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['scope', 'parent_id', 'sort']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
