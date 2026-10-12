<?php

namespace Modules\Language\Contracts;

interface TranslationFileRepositoryInterface
{
    /**
     * @return array<int, array{namespace: string, group: string, label: string}>
     */
    public function allowedFiles(): array;

    /**
     * @return array{namespace: string, group: string, label: string}|null
     */
    public function allowedFile(string $namespace, string $group): ?array;

    /**
     * @return array<string, mixed>
     */
    public function readFileTranslations(string $namespace, string $group, string $locale): array;

    /**
     * @return array<string, string>
     */
    public function availableLocales(): array;

    /**
     * @param  array<string, mixed>  $translations
     * @return array<string, mixed>
     */
    public function flattenTranslations(array $translations): array;
}
