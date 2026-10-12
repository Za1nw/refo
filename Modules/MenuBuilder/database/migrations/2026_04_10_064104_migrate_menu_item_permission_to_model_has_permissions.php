<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\MenuBuilder\Models\MenuItem;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('menu_item_permission')) {
            return;
        }

        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');

        $modelHasPermissionsTable = $tableNames['model_has_permissions'] ?? 'model_has_permissions';
        $modelMorphKey = $columnNames['model_morph_key'] ?? 'model_id';

        if (! Schema::hasTable($modelHasPermissionsTable)) {
            return;
        }

        DB::table('menu_item_permission')
            ->select(['id', 'menu_item_id', 'permission_id'])
            ->orderBy('id')
            ->chunkById(500, function ($rows) use ($modelHasPermissionsTable, $modelMorphKey) {
                $inserts = [];

                foreach ($rows as $row) {
                    $inserts[] = [
                        'permission_id' => $row->permission_id,
                        'model_type' => MenuItem::class,
                        $modelMorphKey => $row->menu_item_id,
                    ];
                }

                if ($inserts !== []) {
                    DB::table($modelHasPermissionsTable)->insertOrIgnore($inserts);
                }
            });

        Schema::dropIfExists('menu_item_permission');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');

        $modelHasPermissionsTable = $tableNames['model_has_permissions'] ?? 'model_has_permissions';
        $modelMorphKey = $columnNames['model_morph_key'] ?? 'model_id';

        if (! Schema::hasTable($modelHasPermissionsTable)) {
            return;
        }

        if (! Schema::hasTable('menu_item_permission')) {
            Schema::create('menu_item_permission', function (Blueprint $table) {
                $table->id();
                $table->foreignId('menu_item_id')
                    ->constrained('menu_items')
                    ->cascadeOnDelete();

                $table->foreignId('permission_id')
                    ->constrained('permissions')
                    ->cascadeOnDelete();

                $table->unique(['menu_item_id', 'permission_id']);
            });
        }

        $rows = DB::table($modelHasPermissionsTable)
            ->select([$modelMorphKey, 'permission_id'])
            ->where('model_type', MenuItem::class)
            ->get();

        if ($rows->isEmpty()) {
            return;
        }

        $inserts = [];
        foreach ($rows as $row) {
            $inserts[] = [
                'menu_item_id' => $row->{$modelMorphKey},
                'permission_id' => $row->permission_id,
            ];
        }

        foreach (array_chunk($inserts, 500) as $chunk) {
            DB::table('menu_item_permission')->insertOrIgnore($chunk);
        }

        DB::table($modelHasPermissionsTable)
            ->where('model_type', MenuItem::class)
            ->delete();
    }
};
