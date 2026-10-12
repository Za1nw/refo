<?php

namespace Modules\Language\Services;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Modules\Language\Contracts\LanguageTranslationRepositoryInterface;
use Modules\Language\Contracts\TranslationFileRepositoryInterface;
use Modules\Language\DTOs\TranslationEntryData;
use Modules\Language\DTOs\TranslationFileData;

class LanguageTranslationService
{
    public function __construct(
        private readonly TranslationFileRepositoryInterface $fileRepository,
        private readonly LanguageTranslationRepositoryInterface $translationRepository,
    ) {}

    /**
     * @param  array{search?: string, namespace?: string, locale?: string, page?: int, per_page?: int, sort_by?: string, sort_order?: string}  $filters
     */
    public function paginateFiles(array $filters, int $perPage, string $indexUrl): LengthAwarePaginator
    {
        $namespaceFilter = Str::lower(trim((string) ($filters['namespace'] ?? '')));
        $search = trim((string) ($filters['search'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $sortBy = (string) ($filters['sort_by'] ?? 'label');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        $files = collect($this->fileRepository->allowedFiles())
            ->filter(function (array $file) use ($namespaceFilter, $search): bool {
                if ($namespaceFilter !== '' && Str::lower($file['namespace']) !== $namespaceFilter) {
                    return false;
                }

                if ($search === '') {
                    return true;
                }

                $haystack = implode(' ', [
                    $file['label'],
                    $file['group'],
                    $file['namespace'],
                ]);

                return Str::contains(Str::lower($haystack), Str::lower($search));
            })
            ->map(function (array $file): TranslationFileData {
                $sourceLocale = $this->sourceLocaleFor($file['namespace'], $file['group']);
                $textCount = count($this->fileRepository->flattenTranslations(
                    $this->fileRepository->readFileTranslations($file['namespace'], $file['group'], $sourceLocale)
                ));

                return new TranslationFileData(
                    namespace: $file['namespace'],
                    group: $file['group'],
                    label: $file['label'],
                    textCount: $textCount,
                    editUrl: route('languages.edit', [
                        'namespace' => $file['namespace'],
                        'group' => $file['group'],
                    ]),
                );
            });

        $sorted = match ($sortBy) {
            'group' => $sortOrder === 'desc'
                ? $files->sortByDesc(fn (TranslationFileData $file): string => $file->group)
                : $files->sortBy(fn (TranslationFileData $file): string => $file->group),
            'namespace' => $sortOrder === 'desc'
                ? $files->sortByDesc(fn (TranslationFileData $file): string => $file->namespace)
                : $files->sortBy(fn (TranslationFileData $file): string => $file->namespace),
            'text_count' => $sortOrder === 'desc'
                ? $files->sortByDesc(fn (TranslationFileData $file): int => $file->textCount)
                : $files->sortBy(fn (TranslationFileData $file): int => $file->textCount),
            default => $sortOrder === 'desc'
                ? $files->sortByDesc(fn (TranslationFileData $file): string => $file->label)
                : $files->sortBy(fn (TranslationFileData $file): string => $file->label),
        };

        $items = $sorted->values();
        $total = $items->count();
        $perPage = max(1, min(100, $perPage));

        return new LengthAwarePaginator(
            items: $items->forPage($page, $perPage)->values()->map(fn (TranslationFileData $file): array => $file->toArray())->all(),
            total: $total,
            perPage: $perPage,
            currentPage: $page,
            options: [
                'path' => $indexUrl,
                'query' => array_filter([
                    'search' => $search !== '' ? $search : null,
                    'namespace' => $namespaceFilter !== '' ? $namespaceFilter : null,
                    'page' => $page,
                    'per_page' => $perPage,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ], static fn (mixed $value): bool => $value !== null),
            ],
        );
    }

    /**
     * @return array{
     *     file: array{namespace: string, group: string, label: string},
     *     locale: string,
     *     source_locale: string,
     *     edit_url: string,
     *     update_url: string,
     *     index_url: string,
     *     available_locales: array<int, string>,
     *     entries: array<int, array{key: string, source_value: string, value: string}>
     * }
     */
    /**
     * @param  array{search?: string, page?: int, per_page?: int}  $filters
     */
    public function editorPayload(string $namespace, string $group, string $locale, string $indexUrl, array $filters = []): array
    {
        $file = $this->fileRepository->allowedFile($namespace, $group);

        abort_if($file === null, 404);

        // Use the requested locale as the source for the editor so that
        // switching the locale shows the file values for that locale.
        // Cache flattened file translations for a short period to avoid repeated disk reads.
        $cacheKey = "language:file:{$namespace}:{$group}:{$locale}";
        $sourceTranslations = Cache::remember($cacheKey, 300, fn () => $this->fileRepository->flattenTranslations(
            $this->fileRepository->readFileTranslations($namespace, $group, $locale)
        ));

        // Current file translations are the same shape (kept separate in case behavior changes later)
        $currentFileTranslations = $sourceTranslations;
        $databaseTranslations = $this->translationRepository->valuesForFile($namespace, $group, $locale);

        $search = trim((string) ($filters['search'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        // Lower default per-page to reduce payload size and server work
        $perPage = max(10, min(500, (int) ($filters['per_page'] ?? 50)));

        $allEntries = [];
        $scoredEntries = [];

        $normalizedSearch = $this->normalizeSearchText($search);
        $searchTokens = array_values(array_filter(
            preg_split('/\s+/u', $normalizedSearch) ?: [],
            static fn (string $v): bool => $v !== '' && mb_strlen($v) >= 2
        ));

        $index = 0;
        foreach ($sourceTranslations as $key => $sourceValue) {
            $index++;
            $databaseValue = array_key_exists($key, $databaseTranslations) ? $databaseTranslations[$key] : null;
            $currentFileValue = array_key_exists($key, $currentFileTranslations) ? $currentFileTranslations[$key] : null;

            $resolvedValue = $databaseValue ?? $currentFileValue ?? $sourceValue;

            $isOverridden = false;
            if ($databaseValue !== null) {
                $compareBase = $currentFileValue ?? $sourceValue;
                $isOverridden = $databaseValue !== $compareBase;
            }

            $row = (new TranslationEntryData(
                key: (string) $key,
                sourceValue: (string) $sourceValue,
                value: (string) $resolvedValue,
                isOverridden: $isOverridden,
            ))->toArray();

            // إذا لم يكن هناك نص بحث، يتم اعتماد الترتيب الطبيعي للملف
            if ($normalizedSearch === '') {
                $allEntries[] = $row;

                continue;
            }

            // حساب درجة التطابق والأهمية ونسبة التشابه
            $score = $this->scoreSearchMatch(
                key: (string) $key,
                value: (string) $resolvedValue,
                sourceValue: (string) $sourceValue,
                normalizedSearch: $normalizedSearch,
                normalizedTokens: $searchTokens,
            );

            if ($score !== null && $score > 0) {
                $scoredEntries[] = [
                    'row' => $row,
                    'score' => $score,
                    'index' => $index,
                ];
            }
        }

        if ($normalizedSearch !== '') {
            // ترتيب النتائج تنازلياً حسب درجة الأهمية والتطابق، ثم الترتيب الأصلي عند التساوي
            usort($scoredEntries, static function (array $first, array $second): int {
                if ($second['score'] === $first['score']) {
                    return $first['index'] <=> $second['index'];
                }

                return $second['score'] <=> $first['score'];
            });

            $allEntries = array_column($scoredEntries, 'row');
        }

        $total = count($allEntries);
        $totalPages = $perPage > 0 ? (int) ceil($total / $perPage) : 1;
        $pageItems = array_values(array_slice($allEntries, ($page - 1) * $perPage, $perPage));

        $translatedCount = count(array_filter($allEntries, fn ($r) => isset($r['value']) && trim((string) $r['value']) !== ''));

        return [
            'file' => $file,
            'locale' => $locale,
            'source_locale' => $locale,
            'edit_url' => route('languages.edit', [
                'namespace' => $namespace,
                'group' => $group,
            ]),
            'update_url' => route('languages.update', [
                'namespace' => $namespace,
                'group' => $group,
            ]),
            'index_url' => $indexUrl,
            'available_locales' => $this->fileRepository->availableLocales(),
            'entries' => $pageItems,
            'entries_meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $totalPages,
            ],
            'total_entries' => $total,
            'translated_count' => $translatedCount,
            'filters' => [
                'search' => $search,
                'page' => $page,
                'per_page' => $perPage,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $translations
     */
    public function saveTranslations(string $namespace, string $group, string $locale, array $translations, bool $restoreSource = false): void
    {
        $file = $this->fileRepository->allowedFile($namespace, $group);

        abort_if($file === null, 404);

        $normalizedNamespace = $file['namespace'];
        $flattened = $restoreSource
            ? $this->fileRepository->flattenTranslations(
                $this->fileRepository->readFileTranslations($normalizedNamespace, $group, $locale)
            )
            : $this->fileRepository->flattenTranslations($translations);

        // Persist only the keys that were actually submitted.
        // This prevents untouched translations from being overwritten with empty values.
        foreach ($flattened as $key => $value) {
            $this->translationRepository->saveTranslation(
                $normalizedNamespace,
                $group,
                $locale,
                (string) $key,
                (string) $value,
            );
        }

        // Invalidate cached flattened file translations for all locales for this file
        foreach ($this->fileRepository->availableLocales() as $l) {
            Cache::forget("language:file:{$normalizedNamespace}:{$group}:{$l}");
        }
    }

    public function sourceLocaleFor(string $namespace, string $group): string
    {
        $availableLocales = $this->fileRepository->availableLocales();
        $preferred = (string) (config('app.fallback_locale') ?? app()->getLocale());

        if (in_array($preferred, $availableLocales, true)) {
            return $preferred;
        }

        $currentLocale = (string) app()->getLocale();

        if (in_array($currentLocale, $availableLocales, true)) {
            return $currentLocale;
        }

        return $availableLocales[0] ?? $preferred;
    }

    /**
     * @return array<int, string>
     */
    public function availableLocales(): array
    {
        return $this->fileRepository->availableLocales();
    }

    /**
     * تطبيع وتنظيف نصوص البحث لمطابقة أدق تدعم الحركات والاختلافات اللغوية العربية.
     *
     * يقوم بتجريد علامات التشكيل، وتوحيد أشكال الألف والهمزات، والتاء المربوطة،
     * والألف المقصورة، ومسح التطويل (الكشيدة) لتسهيل المطابقة الدقيقة.
     *
     * @param  string  $text  النص الخام المراد تطبيعه
     * @return string النص الموحد والنظيف للمقارنة
     */
    public function normalizeSearchText(string $text): string
    {
        if ($text === '') {
            return '';
        }

        // تحويل النص إلى أحرف صغيرة
        $normalized = mb_strtolower($text, 'UTF-8');

        // إزالة التشكيل وعلامات الإعراب والتطويل (الكشيدة)
        $normalized = (string) preg_replace('/[\x{064B}-\x{0652}\x{0670}\x{0640}]/u', '', $normalized);

        // توحيد أشكال الألف والهمزات
        $normalized = (string) preg_replace('/[أإآٱ]/u', 'ا', $normalized);

        // توحيد التاء المربوطة والهاء
        $normalized = (string) preg_replace('/[ة]/u', 'ه', $normalized);

        // توحيد الألف المقصورة والياء
        $normalized = (string) preg_replace('/[ى]/u', 'ي', $normalized);

        // تنظيف المسافات الزائدة
        $normalized = (string) preg_replace('/\s+/u', ' ', $normalized);

        return trim($normalized);
    }

    /**
     * حساب درجة التطابق والأهمية ونسبة التشابه بين نص البحث وسجل الترجمة.
     *
     * سبب معماري: تم بناء خوارزمية التقييم لفرز النتائج بحسب دقة التطابق
     * (تطابق تام، احتواء العبارة، احتواء عكسي للعبارات المجتزأة، نسبة تغطية الكلمات، ونسبة التشابه النصي)،
     * واستبعاد النتائج الهامشية التي لا تشترك سوى بكلمة عامة واحدة عند البحث المتعدد.
     *
     * @param  string  $key  مفتاح الترجمة البرمجي
     * @param  string  $value  القيمة الحالية للترجمة
     * @param  string  $sourceValue  القيمة الأصلية للمقارنة
     * @param  string  $normalizedSearch  نص البحث بعد التطبيع
     * @param  array<int, string>  $normalizedTokens  كلمات البحث المجزأة
     * @return float|null درجة التطابق (أو null إذا كان السجل غير مطابق بالمعايير)
     */
    private function scoreSearchMatch(
        string $key,
        string $value,
        string $sourceValue,
        string $normalizedSearch,
        array $normalizedTokens
    ): ?float {
        if ($normalizedSearch === '') {
            return null;
        }

        $normKey = $this->normalizeSearchText($key);
        $normVal = $this->normalizeSearchText($value);
        $normSrc = $this->normalizeSearchText($sourceValue);

        // إذا كان التطابق تاماً مع القيمة أو المفتاح
        if ($normVal === $normalizedSearch) {
            return 10000.0;
        }

        if ($normKey === $normalizedSearch) {
            return 9000.0;
        }

        if ($normSrc === $normalizedSearch) {
            return 8500.0;
        }

        $score = 0.0;

        // 1. فحص احتواء العبارة الكاملة داخل القيمة أو المفتاح
        if (mb_strpos($normVal, $normalizedSearch) !== false) {
            $lengthRatio = mb_strlen($normalizedSearch) / max(1, mb_strlen($normVal));
            $score += 5000.0 + ($lengthRatio * 1500.0);
        } elseif (mb_strpos($normSrc, $normalizedSearch) !== false) {
            $lengthRatio = mb_strlen($normalizedSearch) / max(1, mb_strlen($normSrc));
            $score += 4500.0 + ($lengthRatio * 1000.0);
        } elseif (mb_strpos($normKey, $normalizedSearch) !== false) {
            $score += 4000.0;
        }

        // 2. فحص الاحتواء العكسي: عندما ينسخ المستخدم عبارة طويلة ويكون سجل الترجمة جزءاً منها
        if (mb_strlen($normVal) >= 4 && mb_strpos($normalizedSearch, $normVal) !== false) {
            $score += 3500.0 + (mb_strlen($normVal) * 20.0);
        } elseif (mb_strlen($normSrc) >= 4 && mb_strpos($normalizedSearch, $normSrc) !== false) {
            $score += 3000.0 + (mb_strlen($normSrc) * 15.0);
        }

        // 3. حساب تغطية الكلمات ومقدار التشابه
        $totalTokens = count($normalizedTokens);
        if ($totalTokens > 0) {
            $matchedTokensInVal = 0;
            $matchedTokensInKey = 0;
            $matchedTokensInSrc = 0;

            foreach ($normalizedTokens as $token) {
                if (mb_strpos($normVal, $token) !== false) {
                    $matchedTokensInVal++;
                }
                if (mb_strpos($normSrc, $token) !== false) {
                    $matchedTokensInSrc++;
                }
                if (mb_strpos($normKey, $token) !== false) {
                    $matchedTokensInKey++;
                }
            }

            $maxMatched = max($matchedTokensInVal, $matchedTokensInSrc, $matchedTokensInKey);

            // استبعاد السجلات التي تطابق كلمة شائعة واحدة فقط عند البحث بأكثر من كلمتين
            if ($totalTokens >= 3 && $maxMatched < 2 && $score === 0.0) {
                return null;
            }

            if ($totalTokens >= 1 && $maxMatched < 1 && $score === 0.0) {
                return null;
            }

            $coverageRatio = $maxMatched / $totalTokens;
            $score += $coverageRatio * 2500.0;
        }

        // 4. قياس نسبة التشابه النصي التقريبي (Text Similarity على مستوى محارف UTF-8)
        $similarityVal = $this->computeUtf8Similarity($normalizedSearch, $normVal);
        $similaritySrc = $this->computeUtf8Similarity($normalizedSearch, $normSrc);
        $maxSimilarity = max($similarityVal, $similaritySrc);

        $score += $maxSimilarity * 10.0;

        // إذا لم يكن هناك تطابق كافٍ إطلاقاً
        if ($score < 100.0) {
            return null;
        }

        return $score;
    }

    /**
     * قياس نسبة التشابه النصي التقريبي بدقة على مستوى محارف UTF-8 (Code Points)
     * لتجنب احتساب بايتات الصدارة المشتركة في الحروف العربية كمطابقة زائفة
     */
    protected function computeUtf8Similarity(string $str1, string $str2): float
    {
        if ($str1 === '' || $str2 === '') {
            return 0.0;
        }

        if ($str1 === $str2) {
            return 100.0;
        }

        $chars1 = mb_str_split($str1);
        $chars2 = mb_str_split($str2);

        if (empty($chars1) || empty($chars2)) {
            return 0.0;
        }

        $uniqueChars = array_values(array_unique(array_merge($chars1, $chars2)));
        if (count($uniqueChars) <= 255) {
            $charMap = array_flip($uniqueChars);
            $mapped1 = implode('', array_map(static fn (string $c): string => chr($charMap[$c]), $chars1));
            $mapped2 = implode('', array_map(static fn (string $c): string => chr($charMap[$c]), $chars2));

            similar_text($mapped1, $mapped2, $percent);

            return (float) $percent;
        }

        similar_text($str1, $str2, $percent);

        return (float) $percent;
    }
}
