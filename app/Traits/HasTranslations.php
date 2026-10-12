<?php

namespace App\Traits;

use App\Models\Translation;
use Illuminate\Support\Facades\Cache;

trait HasTranslations
{
    protected array $pendingTranslations = [];

    /**
     * boot
     */
    public function initializeHasTranslations(): void
    {
        $this->with = array_values(array_unique(array_merge(
            $this->with ?? [],
            ['translations']
        )));
    }

    /**
     * relation
     */
    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    /**
     * 🔥 CORE READ (optimized + safe cache)
     */
    public function t(string $field, ?string $locale = null, mixed $default = null): mixed
    {
        $locale ??= app()->getLocale();
        $key = $this->cacheKey($field, $locale);

        return Cache::remember($key, 3600, function () use ($field, $locale, $default) {

            $translation = $this->translations
                ->where('field', $field)
                ->where('locale', $locale)
                ->first();

            if (! $translation && config('app.fallback_locale')) {

                $translation = $this->translations
                    ->where('field', $field)
                    ->where('locale', config('app.fallback_locale'))
                    ->first();
            }

            return $translation?->value ?? $default;
        });
    }

    /**
     * 🔥 CORE WRITE
     */
    public function setT(string $field, mixed $value, ?string $locale = null): void
    {
        $locale ??= app()->getLocale();

        if (! $this->exists) {
            $this->pendingTranslations[$locale][$field] = $value;

            return;
        }

        $this->translations()->updateOrCreate(
            [
                'locale' => $locale,
                'field' => $field,
            ],
            [
                'value' => $value,
            ]
        );

        $this->flushCache($field, $locale);
    }

    /**
     * bulk
     */
    public function setTranslations(array $data, ?string $locale = null): void
    {
        foreach ($data as $field => $value) {
            $this->setT($field, $value, $locale);
        }
    }

    /**
     * cache key (FIXED)
     */
    protected function cacheKey(string $field, string $locale): string
    {
        return sprintf(
            'translations:%s:%s:%s:%s',
            static::class,
            $this->id ?? 'null',
            $locale,
            $field
        );
    }

    /**
     * flush cache (safe)
     */
    protected function flushCache(string $field, string $locale): void
    {
        Cache::forget($this->cacheKey($field, $locale));
    }

    /**
     * magic getter
     */
    public function __get($key = null)
    {
        if (in_array($key, $this->translatlable)) {
            return $this->t($key);
        }

        return parent::__get($key);
    }

    /**
     * magic setter (safe deferred)
     */
    public function __set($key, $value)
    {
        if (in_array($key, $this->translatlable)) {

            $locale = app()->getLocale();

            $this->pendingTranslations[$locale][$key] = $value;

            return;
        }

        parent::__set($key, $value);
    }

    /**
     * lifecycle
     */
    protected static function bootHasTranslations(): void
    {
        static::saved(function ($model) {

            foreach ($model->pendingTranslations ?? [] as $locale => $fields) {

                foreach ($fields as $field => $value) {

                    $model->translations()->updateOrCreate(
                        [
                            'locale' => $locale,
                            'field' => $field,
                        ],
                        [
                            'value' => $value,
                        ]
                    );

                    $model->flushCache($field, $locale);
                }
            }

            $model->pendingTranslations = [];
        });

        static::deleted(function ($model) {
            $cacheKeys = $model->translations
                ->map(function ($translation) use ($model): string {
                    return $model->cacheKey($translation->field, $translation->locale);
                })
                ->all();

            $model->translations()->delete();

            foreach ($cacheKeys as $cacheKey) {
                Cache::forget($cacheKey);
            }
        });
    }
}
