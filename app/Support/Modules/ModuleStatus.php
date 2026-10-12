<?php

namespace App\Support\Modules;

use Illuminate\Support\Arr;

/**
 * مساعد خفيف للتحقق من تفعيل موديول (nwidart/laravel-modules).
 *
 * يقرأ ملف الحالات (غالبًا modules_statuses.json) ويخزّن النتيجة في الذاكرة
 * طوال عمر عملية PHP الحالية لتقليل عمليات القراءة/التحليل.
 */
class ModuleStatus
{
    /**
     * @var array<string, bool>|null
     */
    private static ?array $cachedStatuses = null;

    public function isEnabled(string $moduleName): bool
    {
        $statuses = self::$cachedStatuses ??= $this->readStatuses();

        return (bool) Arr::get($statuses, $moduleName, false);
    }

    /**
     * @return array<string, bool>
     */
    private function readStatuses(): array
    {
        $file = config('modules.activators.file.statuses-file');

        if (! is_string($file) || $file === '' || ! is_file($file)) {
            return [];
        }

        $contents = file_get_contents($file);

        if (! is_string($contents) || $contents === '') {
            return [];
        }

        $decoded = json_decode($contents, true);

        return is_array($decoded) ? $decoded : [];
    }
}
