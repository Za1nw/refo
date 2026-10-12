<?php

namespace Modules\Language\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Modules\Language\Models\Language;

/**
 * Class TranslationsExporter
 *
 * مسؤول عن تصدير الترجمات من:
 * - ملفات اللغة (lang files)
 * - قاعدة البيانات (DB)
 *
 * مع دمجهم بحيث:
 * قاعدة البيانات لها الأولوية على الملفات.
 *
 * الاستخدام الأساسي:
 * تجهيز ترجمات جاهزة للواجهة (Inertia / API).
 */
class TranslationsExporter
{
    /**
     * تصدير الترجمات النهائية.
     *
     * 🔹 يجمع الترجمات من الملفات + قاعدة البيانات
     * 🔹 DB يتغلب على الملفات
     *
     * @param  string|null  $locale  اللغة المطلوبة (ar, en ...)
     * @param  array|string|null  $namespaces  الموديولات أو *
     * @param  array|string  $groups  ملفات الترجمة أو *
     */
    public function export(
        ?string $locale = null,
        array|string|null $namespaces = null,
        array|string $groups = ['*']
    ): array {
        $locale = $locale ?? app()->getLocale();

        $namespaces = $this->normalizeToArray($namespaces);
        $groups = $this->normalizeToArray($groups);

        $namespaces = $this->resolveNamespaces($namespaces);

        $result = [];

        foreach ($namespaces as $namespace) {

            $path = $this->getNamespacePath($namespace, $locale);

            if (! $path) {
                continue;
            }

            $resolvedGroups = $this->resolveGroups($path, $groups, $namespace);

            foreach ($resolvedGroups as $group) {

                $fileTranslations = $this->loadFileTranslations($path, $group);

                $dbTranslations = $this->loadDatabaseTranslations(
                    $namespace,
                    $group,
                    $locale
                );

                // دمج: DB يغلب الملفات
                $merged = array_replace_recursive($fileTranslations, $dbTranslations);

                $result[$locale][$group] = array_replace_recursive(
                    $result[$locale][$group] ?? [],
                    $merged
                );
            }
        }

        return $result;
    }

    /**
     * تحويل أي قيمة إلى Array موحد.
     */
    private function normalizeToArray(array|string|null $value): array
    {
        if ($value === null) {
            return [];
        }

        return is_string($value) ? [$value] : $value;
    }

    /**
     * تحديد الـ namespaces (Modules + default).
     *
     * 🔹 إذا كان "*" يتم جلب كل Modules تلقائيًا
     * 🔹 default = مجلد lang الأساسي
     */
    private function resolveNamespaces(array $namespaces): array
    {
        // إذا طلب كل شيء
        if (in_array('*', $namespaces, true) || empty($namespaces)) {

            $modules = [];

            foreach (glob(base_path('Modules/*/lang')) as $path) {
                if (is_dir($path)) {
                    $modules[] = strtolower(basename(dirname($path)));
                }
            }

            // مهم: لا نهمل modules
            return array_merge(['default'], $modules);
        }

        if (! in_array('default', $namespaces, true)) {
            $namespaces[] = 'default';
        }

        return $namespaces;
    }

    /**
     * تحديد مسار ملفات اللغة حسب الـ namespace.
     */
    private function getNamespacePath(string $namespace, string $locale): ?string
    {
        if ($namespace === 'default') {
            $path = base_path("lang/{$locale}");

            return is_dir($path) ? $path : null;
        }

        if (app()->bound('modules')) {
            $module = app('modules')->find($namespace);
            if ($module) {
                $path = $module->getPath()."/lang/{$locale}";
                if (is_dir($path)) {
                    return $path;
                }
            }
        }

        $studlyPath = base_path('Modules/'.Str::studly($namespace)."/lang/{$locale}");
        if (is_dir($studlyPath)) {
            return $studlyPath;
        }

        $lowerPath = base_path('Modules/'.Str::lower($namespace)."/lang/{$locale}");
        if (is_dir($lowerPath)) {
            return $lowerPath;
        }

        return null;
    }

    /**
     * استخراج ملفات الترجمة (groups) داخل المجلد.
     */
    private function resolveGroups(string $path, array $groups, string $namespace = ''): array
    {
        if ($namespace === 'default') {
            $defaultGroups = in_array('*', $groups, true) ? [] : $groups;
            if (! in_array('main', $defaultGroups, true)) {
                $defaultGroups[] = 'main';
            }
            if (in_array('*', $groups, true)) {
                $files = File::files($path);

                return array_map(fn ($file) => pathinfo($file, PATHINFO_FILENAME), $files);
            }

            return $defaultGroups;
        }

        if (! in_array('*', $groups, true)) {
            return $groups;
        }

        $files = File::files($path);

        return array_map(
            fn ($file) => pathinfo($file, PATHINFO_FILENAME),
            $files
        );
    }

    /**
     * تحميل الترجمات من ملف PHP.
     *
     * 🔹 مثال: auth.php => array
     */
    private function loadFileTranslations(string $path, string $group): array
    {
        $file = $path."/{$group}.php";

        if (! File::exists($file)) {
            return [];
        }

        $translations = require $file;

        return is_array($translations) ? $translations : [];
    }

    /**
     * تحميل الترجمات من قاعدة البيانات.
     *
     * 🔹 يعتمد على:
     * namespace + group + locale
     */
    private function loadDatabaseTranslations(
        string $namespace,
        string $group,
        string $locale
    ): array {
        try {
            $translations = Language::getAllLang($namespace, $group)
                ->where('language', $locale)
                ->pluck('value', 'key')
                ->toArray();

            return $this->nestTranslations($translations);
        } catch (\Throwable) {
            // لا نكسر النظام بسبب DB
            return [];
        }
    }

    /**
     * @param  array<string, string>  $translations
     */
    private function nestTranslations(array $translations): array
    {
        $nested = [];

        foreach ($translations as $key => $value) {
            Arr::set($nested, $key, $value);
        }

        return $nested;
    }
}
