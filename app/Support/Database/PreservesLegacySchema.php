<?php

namespace App\Support\Database;

use Closure;
use Illuminate\Database\Connection;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use ReflectionClass;
use RuntimeException;

trait PreservesLegacySchema
{
    /**
     * تحديد المعرف الفريد للهجرة الحالية بناءً على اسم الملف.
     *
     * @return string اسم ملف الهجرة بدون الامتداد
     */
    protected function schemaOwner(): string
    {
        return pathinfo((new ReflectionClass($this))->getFileName(), PATHINFO_FILENAME);
    }

    /**
     * الحصول على اتصال قاعدة البيانات المستخدم في الهجرة.
     *
     * @return Connection اتصال قاعدة البيانات النشط
     */
    protected function resolveConnection(): Connection
    {
        $connectionName = property_exists($this, 'connection') ? $this->connection : null;

        return DB::connection($connectionName);
    }

    /**
     * الحصول على باني المخطط (Schema Builder) للاتصال الحالي.
     *
     * @return Builder كائن بناء المخطط
     */
    protected function resolveSchema(): Builder
    {
        $connectionName = property_exists($this, 'connection') ? $this->connection : null;

        return Schema::connection($connectionName);
    }

    /**
     * تسجيل تغيير المخطط الذي تم إنشاؤه بواسطة هذه الهجرة.
     *
     * @param  string  $table  اسم الجدول المتأثر
     * @param  string  $column  اسم العمود (فارغ في حالة إنشاء جدول كامل)
     */
    protected function recordSchemaChange(string $table, string $column = ''): void
    {
        $schema = $this->resolveSchema();
        $connection = $this->resolveConnection();

        if (! $schema->hasTable('legacy_schema_changes')) {
            $schema->create('legacy_schema_changes', function (Blueprint $table): void {
                $table->id();
                $table->string('migration');
                $table->string('table_name');
                $table->string('column_name')->default('');
                $table->unique(['migration', 'table_name', 'column_name'], 'legacy_schema_changes_unique');
            });
        }

        $connection->table('legacy_schema_changes')->insertOrIgnore([
            'migration' => $this->schemaOwner(),
            'table_name' => $table,
            'column_name' => $column,
        ]);
    }

    /**
     * إنشاء جدول جديد إذا لم يكن موجوداً مسبقاً، مع توثيق إنشائه لحمايته أثناء التراجع.
     *
     * @param  string  $table  اسم الجدول المراد إنشاؤه
     * @param  Closure  $definition  دالة تعريف حقول ومفاتيح الجدول
     */
    protected function createPreservedTable(string $table, Closure $definition): void
    {
        $schema = $this->resolveSchema();

        if ($schema->hasTable($table)) {
            return;
        }

        $schema->create($table, $definition);
        $this->recordSchemaChange($table);
    }

    /**
     * إضافة عمود جديد إلى جدول إذا لم يكن موجوداً مسبقاً، مع توثيقه.
     *
     * @param  string  $table  اسم الجدول
     * @param  string  $column  اسم العمود المراد إضافته
     * @param  Closure  $definition  دالة تعريف العمود
     */
    protected function addPreservedColumn(string $table, string $column, Closure $definition): void
    {
        $schema = $this->resolveSchema();

        if (! $schema->hasColumn($table, $column)) {
            $schema->table($table, $definition);
            $this->recordSchemaChange($table, $column);
        }
    }

    /**
     * التراجع عن كائنات المخطط التي أنشأتها هذه الهجرة فقط، مع منع الكتابة أثناء الفحص والحذف.
     *
     * ملاحظة معمارية: يتم قفل الجداول المتأثرة لحظر عمليات الكتابة المتزامنة (Concurrent Writes)
     * من لحظة فحص خلو الكائنات من البيانات وحتى إتمام الحذف الفعلي، لمنع حدوث فجوة زمنية (Race Condition)
     * قد تتسبب في حذف صفوف أو بيانات جديدة أضافها مستخدم بعد الفحص الأولي (dev.mysql.com).
     *
     * @throws RuntimeException إذا كان الجدول أو العمود يحتوي على بيانات، أو إذا كانت الكتابة غير متوقفة
     */
    protected function rollbackPreservedSchema(): void
    {
        $schema = $this->resolveSchema();
        $connection = $this->resolveConnection();

        if (! $schema->hasTable('legacy_schema_changes')) {
            return;
        }

        $changes = $connection->table('legacy_schema_changes')
            ->where('migration', $this->schemaOwner())
            ->orderByDesc('id')
            ->get();

        if ($changes->isEmpty()) {
            return;
        }

        if ($this->shouldRequireWritersStopped() && ! $this->areWritersStopped()) {
            throw new RuntimeException('Rollback refused: writers must be stopped before rolling back preserved schema.');
        }

        $affectedTables = $changes
            ->pluck('table_name')
            ->unique()
            ->filter(fn (string $tableName): bool => $schema->hasTable($tableName))
            ->values()
            ->all();

        $locked = false;
        $driver = $connection->getDriverName();

        try {
            $locked = $this->blockWrites($connection, $affectedTables);

            // التحقق من خلو الكائنات من البيانات أثناء حظر الكتابة
            foreach ($changes as $change) {
                if ($change->column_name === '' && $schema->hasTable($change->table_name)
                    && $connection->table($change->table_name)->exists()) {
                    throw new RuntimeException("Rollback refused: {$change->table_name} contains data.");
                }

                if ($change->column_name !== '' && $schema->hasColumn($change->table_name, $change->column_name)
                    && $connection->table($change->table_name)->whereNotNull($change->column_name)->exists()) {
                    throw new RuntimeException("Rollback refused: {$change->table_name}.{$change->column_name} contains data.");
                }
            }

            // تنفيذ الحذف أثناء استمرار حظر الكتابة
            foreach ($changes as $change) {
                if ($change->column_name === '') {
                    $schema->dropIfExists($change->table_name);
                } elseif ($schema->hasColumn($change->table_name, $change->column_name)) {
                    $schema->table($change->table_name, fn (Blueprint $table) => $table->dropColumn($change->column_name));
                }
            }

            if ($locked && in_array($driver, ['pgsql', 'sqlite'], true)) {
                if ($connection->transactionLevel() > 0) {
                    $connection->commit();
                }
                $locked = false;
            }
        } catch (\Throwable $throwable) {
            if ($locked && in_array($driver, ['pgsql', 'sqlite'], true)) {
                if ($connection->transactionLevel() > 0) {
                    $connection->rollBack();
                }
                $locked = false;
            }
            throw $throwable;
        } finally {
            if ($locked) {
                $this->unblockWrites($connection, $locked);
            }
        }

        $connection->table('legacy_schema_changes')
            ->whereIn('id', $changes->pluck('id'))
            ->delete();
    }

    /**
     * حظر عمليات الكتابة على الجداول المتأثرة من بداية فحص البيانات وحتى إتمام الحذف.
     *
     * @param  Connection  $connection  اتصال قاعدة البيانات
     * @param  list<string>  $tables  قائمة أسماء الجداول المراد قفلها
     * @return bool دلالة ما إذا تم تفعيل القفل
     */
    protected function blockWrites(Connection $connection, array $tables): bool
    {
        if (empty($tables)) {
            return false;
        }

        $driver = $connection->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $grammar = $connection->getQueryGrammar();
            $lockClauses = array_map(
                fn (string $tableName): string => $grammar->wrapTable($tableName).' WRITE',
                $tables
            );

            $connection->statement('LOCK TABLES '.implode(', ', $lockClauses));

            return true;
        }

        if ($driver === 'pgsql') {
            if ($connection->transactionLevel() === 0) {
                $connection->beginTransaction();
            }

            $grammar = $connection->getQueryGrammar();
            $tableList = implode(', ', array_map(
                fn (string $tableName): string => $grammar->wrapTable($tableName),
                $tables
            ));

            $connection->statement("LOCK TABLE {$tableList} IN ACCESS EXCLUSIVE MODE");

            return true;
        }

        if ($driver === 'sqlite') {
            if ($connection->transactionLevel() === 0) {
                $connection->statement('BEGIN IMMEDIATE');

                return true;
            }
        }

        return false;
    }

    /**
     * إلغاء حظر عمليات الكتابة عن الجداول بعد إتمام التراجع أو عند حدوث خطأ.
     *
     * @param  Connection  $connection  اتصال قاعدة البيانات
     * @param  bool  $locked  حالة القفل السابقة
     */
    protected function unblockWrites(Connection $connection, bool $locked): void
    {
        if (! $locked) {
            return;
        }

        $driver = $connection->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $connection->statement('UNLOCK TABLES');
        } elseif (in_array($driver, ['pgsql', 'sqlite'], true)) {
            if ($connection->transactionLevel() > 0) {
                $connection->commit();
            }
        }
    }

    /**
     * التحقق مما إذا كانت عمليات الكتابة الخارجية متوقفة حالياً (وضع الصيانة).
     */
    protected function areWritersStopped(): bool
    {
        return app()->isDownForMaintenance();
    }

    /**
     * تحديد ما إذا كان التراجع يشترط إيقاف الكتابة مسبقاً.
     */
    protected function shouldRequireWritersStopped(): bool
    {
        if (property_exists($this, 'requireWritersStopped') && is_bool($this->requireWritersStopped)) {
            return $this->requireWritersStopped;
        }

        return (bool) config('database.require_writers_stopped_for_rollback', false);
    }
}
