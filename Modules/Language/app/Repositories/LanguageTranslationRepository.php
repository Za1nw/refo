<?php

namespace Modules\Language\Repositories;

use Modules\Language\Contracts\LanguageTranslationRepositoryInterface;
use Modules\Language\Models\Language;

class LanguageTranslationRepository implements LanguageTranslationRepositoryInterface
{
    public function valuesForFile(string $namespace, string $group, string $language): array
    {
        return Language::query()
            ->forFile($namespace, $group)
            ->forLocale($language)
            ->pluck('value', 'key')
            ->toArray();
    }

    public function saveTranslation(string $namespace, string $group, string $language, string $key, string $value): void
    {
        $translation = Language::query()
            ->withTrashed()
            ->where([
                'namespace' => $namespace,
                'group' => $group,
                'language' => $language,
                'key' => $key,
            ])
            ->first();

        if ($translation === null) {
            $translation = new Language([
                'namespace' => $namespace,
                'group' => $group,
                'language' => $language,
                'key' => $key,
            ]);
        }

        $translation->value = $value;
        $translation->namespace = $namespace;
        $translation->group = $group;
        $translation->language = $language;
        $translation->key = $key;

        if ($translation->trashed()) {
            $translation->restore();
        }

        $translation->save();
    }

    public function deleteTranslation(string $namespace, string $group, string $language, string $key): void
    {
        $translation = Language::query()
            ->forFile($namespace, $group)
            ->forLocale($language)
            ->where('key', $key)
            ->first();

        $translation?->delete();
    }
}
