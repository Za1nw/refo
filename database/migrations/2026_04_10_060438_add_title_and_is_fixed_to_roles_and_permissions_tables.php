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
        $tableNames = config('permission.table_names');

        Schema::table($tableNames['roles'], function (Blueprint $table) use ($tableNames) {
            if (! Schema::hasColumn($tableNames['roles'], 'title')) {
                $table->string('title')->nullable();
            }

            if (! Schema::hasColumn($tableNames['roles'], 'is_fixed')) {
                $table->boolean('is_fixed')->default(false);
            }
        });

        Schema::table($tableNames['permissions'], function (Blueprint $table) use ($tableNames) {
            if (! Schema::hasColumn($tableNames['permissions'], 'is_fixed')) {
                $table->boolean('is_fixed')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');

        Schema::table($tableNames['roles'], function (Blueprint $table) use ($tableNames) {
            if (Schema::hasColumn($tableNames['roles'], 'title')) {
                $table->dropColumn('title');
            }

            if (Schema::hasColumn($tableNames['roles'], 'is_fixed')) {
                $table->dropColumn('is_fixed');
            }
        });

        Schema::table($tableNames['permissions'], function (Blueprint $table) use ($tableNames) {
            if (Schema::hasColumn($tableNames['permissions'], 'is_fixed')) {
                $table->dropColumn('is_fixed');
            }
        });
    }
};
