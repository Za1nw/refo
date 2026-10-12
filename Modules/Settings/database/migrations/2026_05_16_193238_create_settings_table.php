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
        $this->createPreservedTable('settings', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('name')->nullable();
            $table->text('val')->nullable();

            $table->string('type', 90)->default('string');

            $table->integer('created_by')->unsigned()->nullable();
            $table->integer('updated_by')->unsigned()->nullable();
            $table->integer('deleted_by')->unsigned()->nullable();

            $table->timestamps();
            $table->softDeletes();
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
