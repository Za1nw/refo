<?php

use App\Support\Database\PreservesLegacySchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DummyMigrationFixture extends Migration
{
    use PreservesLegacySchema;

    public bool $requireWritersStopped = false;

    public function testOwner(): string
    {
        return $this->schemaOwner();
    }

    public function createTable(string $table): void
    {
        $this->createPreservedTable($table, function (Blueprint $table): void {
            $table->id();
            $table->string('name')->nullable();
            $table->timestamps();
        });
    }

    public function addColumn(string $table, string $column): void
    {
        $this->addPreservedColumn($table, $column, function (Blueprint $table) use ($column): void {
            $table->string($column)->nullable();
        });
    }

    public function rollback(): void
    {
        $this->rollbackPreservedSchema();
    }
}

beforeEach(function (): void {
    Schema::dropIfExists('test_dummy_table');
    Schema::dropIfExists('legacy_schema_changes');
});

afterEach(function (): void {
    Schema::dropIfExists('test_dummy_table');
    Schema::dropIfExists('legacy_schema_changes');
});

test('createPreservedTable creates table and logs to legacy_schema_changes', function (): void {
    $migration = new DummyMigrationFixture;
    $migration->createTable('test_dummy_table');

    expect(Schema::hasTable('test_dummy_table'))->toBeTrue()
        ->and(Schema::hasTable('legacy_schema_changes'))->toBeTrue();

    $record = DB::table('legacy_schema_changes')
        ->where('table_name', 'test_dummy_table')
        ->where('column_name', '')
        ->first();

    expect($record)->not->toBeNull();
});

test('rollbackPreservedSchema refuses rollback if table contains data and leaves table intact', function (): void {
    $migration = new DummyMigrationFixture;
    $migration->createTable('test_dummy_table');

    DB::table('test_dummy_table')->insert([
        'name' => 'Active Record',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(fn () => $migration->rollback())
        ->toThrow(RuntimeException::class, 'Rollback refused: test_dummy_table contains data.');

    expect(Schema::hasTable('test_dummy_table'))->toBeTrue();

    $record = DB::table('legacy_schema_changes')
        ->where('table_name', 'test_dummy_table')
        ->where('column_name', '')
        ->first();

    expect($record)->not->toBeNull();
});

test('rollbackPreservedSchema refuses rollback if column contains data', function (): void {
    $migration = new DummyMigrationFixture;
    $migration->createTable('test_dummy_table');

    $migration->addColumn('test_dummy_table', 'custom_field');

    DB::table('test_dummy_table')->insert([
        'name' => 'Sample',
        'custom_field' => 'Populated value',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(fn () => $migration->rollback())
        ->toThrow(RuntimeException::class, 'Rollback refused: test_dummy_table.custom_field contains data.');

    expect(Schema::hasColumn('test_dummy_table', 'custom_field'))->toBeTrue();
});

test('rollbackPreservedSchema successfully drops table and deletes change log when empty', function (): void {
    $migration = new DummyMigrationFixture;
    $migration->createTable('test_dummy_table');

    expect(Schema::hasTable('test_dummy_table'))->toBeTrue();

    $migration->rollback();

    expect(Schema::hasTable('test_dummy_table'))->toBeFalse();

    $record = DB::table('legacy_schema_changes')
        ->where('table_name', 'test_dummy_table')
        ->first();

    expect($record)->toBeNull();
});

test('rollbackPreservedSchema successfully drops column and deletes change log when column is empty', function (): void {
    $migration = new DummyMigrationFixture;
    $migration->createTable('test_dummy_table');
    $migration->addColumn('test_dummy_table', 'custom_field');

    expect(Schema::hasColumn('test_dummy_table', 'custom_field'))->toBeTrue();

    $migration->rollback();

    // The rollback drops in reverse order: custom_field first, then test_dummy_table
    expect(Schema::hasTable('test_dummy_table'))->toBeFalse();

    $record = DB::table('legacy_schema_changes')
        ->where('table_name', 'test_dummy_table')
        ->first();

    expect($record)->toBeNull();
});

test('rollbackPreservedSchema refuses rollback when writers are required to be stopped and app is running', function (): void {
    $migration = new DummyMigrationFixture;
    $migration->requireWritersStopped = true;
    $migration->createTable('test_dummy_table');

    expect(fn () => $migration->rollback())
        ->toThrow(RuntimeException::class, 'Rollback refused: writers must be stopped before rolling back preserved schema.');
});
