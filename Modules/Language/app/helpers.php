<?php

use Modules\Language\Services\TranslationsExporter;

if (! function_exists('getTranslations')) {
    /**
     * Load translations from files + database with optional filtering by namespace(s) and group(s)
     *
     * @param  string|null  $locale
     * @param  array|string|null  $namespaces
     * @param  array|string|null  $groups
     */
    function getTranslations($locale = null, $namespaces = null, $groups = ['*']): array
    {
        $locale = $locale ?? app()->getLocale();

        return app(TranslationsExporter::class)->export(
            locale: $locale,
            namespaces: $namespaces,
            groups: $groups,
        );
    }
}

if (! function_exists('t')) {
    function t(string $key, ?string $default = null, array $replace = [], ?string $locale = null): string
    {
        $locale = $locale ?? app()->getLocale();

        $translation = trans($key, $replace, $locale);

        if ($translation === $key) {
            return $default ?? $key;
        }

        return $translation;
    }
}
