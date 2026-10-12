<?php

namespace App\Support\Inertia;

use App\Support\Modules\ModuleStatus;
use Inertia\Inertia;

/**
 * مشاركة خصائص Inertia المشتركة لصفحات الموديولات.
 *
 * - يشارك اسم الموديول دائمًا.
 * - يشارك الترجمات فقط إذا كان موديول Language مفعّل.
 *
 * الهدف: بقاء التطبيق يعمل حتى لو لم يكن Language موجودًا/مفعّلًا.
 */
class InertiaModuleShare
{
    public function __construct(private readonly ModuleStatus $moduleStatus) {}

    /**
     * مشاركة بيانات الموديول + الترجمات (اختياري).
     *
     * @param  string  $moduleConfigKey  مفتاح الإعداد الذي يحتوي اسم الموديول.
     * @param  string  $moduleFallbackName  الاسم الافتراضي عند عدم وجود الإعداد.
     * @param  array<string>|string|null  $translationNamespaces  مساحات الأسماء للترجمات (مثال: 'blog' أو ['blog', 'main'] أو null لكل المساحات).
     * @param  array<string>|string  $translationGroups  مجموعات الترجمات (مثال: 'validation' أو ['validation', 'messages']).
     */
    public function share(
        string $moduleConfigKey,
        string $moduleFallbackName,
        array|string|null $translationNamespaces,
        array|string $translationGroups = ['*'],
    ): void {
        Inertia::share('module', $this->resolveModuleName(
            config($moduleConfigKey, $moduleFallbackName),
            $moduleFallbackName,
        ));

        Inertia::share('translations', function () use ($translationNamespaces, $translationGroups) {
            if (! $this->moduleStatus->isEnabled('Language')) {
                return [];
            }

            $exporterClass = 'Modules\\Language\\Services\\TranslationsExporter';

            if (! class_exists($exporterClass)) {
                return [];
            }

            return app($exporterClass)->export(
                namespaces: $translationNamespaces,
                groups: $translationGroups,
            );
        });
    }

    private function resolveModuleName(mixed $moduleValue, string $fallback): string
    {
        if (is_string($moduleValue) && $moduleValue !== '') {
            return $moduleValue;
        }

        if (is_array($moduleValue)) {
            $name = $moduleValue['name'] ?? null;

            if (is_string($name) && $name !== '') {
                return $name;
            }
        }

        return $fallback;
    }
}
