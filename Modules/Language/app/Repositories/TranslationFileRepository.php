<?php

namespace Modules\Language\Repositories;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Modules\Language\Contracts\TranslationFileRepositoryInterface;

class TranslationFileRepository implements TranslationFileRepositoryInterface
{
    public function allowedFiles(): array
    {
        $files = config('language.translatable_files', []);

        if (! is_array($files)) {
            return [];
        }

        return collect($files)
            ->filter(fn (mixed $item): bool => is_array($item) && isset($item['group'], $item['label'], $item['namespace']))
            ->map(fn (array $item): array => [
                'namespace' => (string) $item['namespace'],
                'group' => (string) $item['group'],
                'label' => (string) $item['label'],
            ])
            ->values()
            ->all();
    }

    public function allowedFile(string $namespace, string $group): ?array
    {
        foreach ($this->allowedFiles() as $file) {
            if ($this->matchesFile($file, $namespace, $group)) {
                return $file;
            }
        }

        return null;
    }

    public function readFileTranslations(string $namespace, string $group, string $locale): array
    {
        $path = $this->resolveFilePath($namespace, $group, $locale);

        if ($path === null || ! File::exists($path)) {
            return [];
        }

        $translations = require $path;

        return is_array($translations) ? $translations : [];
    }

    public function availableLocales(): array
    {
        $locales = [];

        foreach ($this->allowedFiles() as $file) {
            foreach ($this->localeFoldersForNamespace($file['namespace']) as $locale) {
                $locales[$locale] = $locale;
            }
        }

        ksort($locales);

        return array_values($locales);
    }

    public function flattenTranslations(array $translations): array
    {
        return $this->flattenNestedTranslations($translations);
    }

    private function matchesFile(array $file, string $namespace, string $group): bool
    {
        return Str::lower($file['namespace']) === Str::lower($namespace)
            && $file['group'] === $group;
    }

    private function resolveFilePath(string $namespace, string $group, string $locale): ?string
    {
        if (Str::lower($namespace) === 'default') {
            $path = base_path("lang/{$locale}/{$group}.php");

            return is_file($path) ? $path : null;
        }

        if (app()->bound('modules')) {
            $module = app('modules')->find($namespace);
            if ($module) {
                $path = $module->getPath()."/lang/{$locale}/{$group}.php";
                if (is_file($path)) {
                    return $path;
                }
            }
        }

        $studlyModulePath = base_path('Modules/'.Str::studly($namespace)."/lang/{$locale}/{$group}.php");

        if (is_file($studlyModulePath)) {
            return $studlyModulePath;
        }

        $lowerModulePath = base_path('Modules/'.Str::lower($namespace)."/lang/{$locale}/{$group}.php");

        return is_file($lowerModulePath) ? $lowerModulePath : null;
    }

    private function localeFoldersForNamespace(string $namespace): array
    {
        if (Str::lower($namespace) === 'default') {
            return $this->readLocaleFolders(base_path('lang'));
        }

        if (app()->bound('modules')) {
            $module = app('modules')->find($namespace);
            if ($module) {
                $path = $module->getPath().'/lang';
                if (is_dir($path)) {
                    return $this->readLocaleFolders($path);
                }
            }
        }

        $studlyModulePath = base_path('Modules/'.Str::studly($namespace).'/lang');

        if (is_dir($studlyModulePath)) {
            return $this->readLocaleFolders($studlyModulePath);
        }

        $lowerModulePath = base_path('Modules/'.Str::lower($namespace).'/lang');

        return is_dir($lowerModulePath) ? $this->readLocaleFolders($lowerModulePath) : [];
    }

    private function readLocaleFolders(string $path): array
    {
        if (! is_dir($path)) {
            return [];
        }

        return collect(File::directories($path))
            ->map(fn (string $directory): string => basename($directory))
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $translations
     * @return array<string, mixed>
     */
    private function flattenNestedTranslations(array $translations, string $prefix = ''): array
    {
        $flattened = [];

        foreach ($translations as $key => $value) {
            $dotKey = $prefix === '' ? (string) $key : $prefix.'.'.$key;

            if (is_array($value)) {
                foreach ($this->flattenNestedTranslations($value, $dotKey) as $nestedKey => $nestedValue) {
                    $flattened[$nestedKey] = $nestedValue;
                }

                continue;
            }

            $flattened[$dotKey] = is_scalar($value) || $value === null ? (string) $value : '';
        }

        return $flattened;
    }
}
