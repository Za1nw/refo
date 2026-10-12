<?php

namespace Modules\Language\Models\Concerns;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Modules\Language\Models\Language;

/**
 * Trait CachesLanguageTranslations
 *
 * مسؤول عن:
 * - جلب الترجمات من قاعدة البيانات مع كاش
 * - بناء مفاتيح الكاش بشكل موحد
 * - حذف الكاش عند التحديث/الحذف
 *
 * الفكرة الأساسية:
 * namespace + group + language = مفتاح كاش فريد
 */
trait CachesLanguageTranslations
{
    /**
     * جلب الترجمات من قاعدة البيانات مع كاش.
     *
     * 🔹 في الإنتاج: يستخدم cache
     * 🔹 في التطوير: بدون cache (للتحديث الفوري)
     */
    public static function getAllLang(?string $namespace = null, ?string $group = null): Collection
    {
        $namespace = Language::normalizeWildcard($namespace);
        $group = Language::normalizeWildcard($group);

        $query = function () use ($namespace, $group) {
            return Language::baseQuery($namespace, $group)->get();
        };

        if (! app()->isProduction()) {
            return $query();
        }

        return Cache::rememberForever(
            Language::cacheKey($namespace, $group),
            $query
        );
    }

    /**
     * بناء الاستعلام الأساسي بدون تكرار.
     */
    private static function baseQuery(?string $namespace, ?string $group)
    {
        return Language::query()
            ->when($namespace, fn ($q) => $q->whereRaw('LOWER(namespace) = ?', [Str::lower($namespace)]))
            ->when($group, fn ($q) => $q->where('group', $group));
    }

    /**
     * تحويل * إلى null لتوحيد التعامل.
     */
    private static function normalizeWildcard(?string $value): ?string
    {
        if ($value === null || $value === '' || $value === '*') {
            return null;
        }

        return $value;
    }

    /**
     * إنشاء مفتاح الكاش.
     *
     * أمثلة:
     * - lang.all
     * - lang.auth
     * - lang.auth.validation
     */
    private static function cacheKey(?string $namespace, ?string $group): string
    {
        $key = 'lang';

        if ($namespace) {
            $key .= '.'.Str::lower($namespace);
        }

        if ($group) {
            $key .= ".{$group}";
        }

        return $key;
    }

    /**
     * حذف الكاش بشكل ذكي عند أي تغيير.
     *
     * يتم حذف:
     * - الكاش القديم
     * - الكاش الجديد
     */
    public static function flushSmartCache(Language $language): void
    {
        $oldNamespace = $language->getOriginal('namespace');
        $oldGroup = $language->getOriginal('group');

        $newNamespace = $language->namespace;
        $newGroup = $language->group;

        static::forgetCache($oldNamespace, $oldGroup);
        static::forgetCache($newNamespace, $newGroup);
    }

    /**
     * حذف كاش بناءً على namespace + group.
     */
    public static function forgetCache(?string $namespace, ?string $group): void
    {
        $namespace = self::normalizeWildcard($namespace);
        $group = self::normalizeWildcard($group);

        Cache::forget(self::cacheKey($namespace, $group));
    }
}
