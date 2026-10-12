<?php

namespace Modules\Language\Contracts;

interface LanguageTranslationRepositoryInterface
{
    /**
     * @return array<string, string>
     */
    public function valuesForFile(string $namespace, string $group, string $language): array;

    public function saveTranslation(string $namespace, string $group, string $language, string $key, string $value): void;

    public function deleteTranslation(string $namespace, string $group, string $language, string $key): void;
}
