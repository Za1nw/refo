<?php

namespace Modules\Language\Helpers;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Translation\FileLoader;
use Modules\Language\Models\Language;

class CustomTranslationLoader extends FileLoader
{
    public function __construct($files, $paths)
    {
        parent::__construct($files, $paths);

        try {
            $log = storage_path('logs/custom_translation_loader.log');
            file_put_contents($log, '['.date('c')."] CustomTranslationLoader constructed\n", FILE_APPEND);
        } catch (\Throwable $e) {
            // ignore logging failures in tinker
        }
    }

    /**
     * Load translations from files + database
     */
    public function load($locale, $group, $namespace = null)
    {
        $fileTranslations = parent::load($locale, $group, $namespace);
        $moduleTranslations = $this->loadModuleTranslations($locale, $group, $namespace);

        try {
            $dbTranslations = Language::getAllLang($namespace, $group)
                ->where('language', $locale)
                ->pluck('value', 'key')
                ->toArray();
        } catch (\Throwable $e) {
            $dbTranslations = [];
        }

        $nestedDatabaseTranslations = $this->nestTranslations($dbTranslations);

        return array_replace_recursive(
            $fileTranslations,
            $moduleTranslations,
            $nestedDatabaseTranslations,
        );
    }

    private function loadModuleTranslations(string $locale, string $group, mixed $namespace): array
    {
        if (! is_string($namespace) || $namespace === '' || $namespace === 'default') {
            return [];
        }

        $moduleFilePath = $this->resolveModuleLangFile($namespace, $locale, $group);

        if (! $moduleFilePath || ! is_file($moduleFilePath)) {
            return [];
        }

        $translations = require $moduleFilePath;

        return is_array($translations) ? $translations : [];
    }

    private function resolveModuleLangFile(string $namespace, string $locale, string $group): ?string
    {
        if (app()->bound('modules')) {
            $module = app('modules')->find($namespace);
            if ($module) {
                $path = $module->getPath()."/lang/{$locale}/{$group}.php";
                if (is_file($path)) {
                    return $path;
                }
            }
        }

        $studlyPath = base_path('Modules/'.Str::studly($namespace)."/lang/{$locale}/{$group}.php");
        if (is_file($studlyPath)) {
            return $studlyPath;
        }

        $lowerPath = base_path('Modules/'.Str::lower($namespace)."/lang/{$locale}/{$group}.php");
        if (is_file($lowerPath)) {
            return $lowerPath;
        }

        return null;
    }

    /**
     * @param  array<string, string>  $translations
     */
    private function nestTranslations(array $translations): array
    {
        $nested = [];

        foreach ($translations as $key => $value) {
            Arr::set($nested, (string) $key, $value);
        }

        return $nested;
    }
}
