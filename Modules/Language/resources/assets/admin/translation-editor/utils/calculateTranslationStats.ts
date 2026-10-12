import type { TranslationEntryRow } from '../types/translation-editor';

export function calculateTranslationStats(entries: TranslationEntryRow[], totalEntries?: number, translatedCount?: number) {
    const safeTotalEntries = totalEntries ?? entries.length;
    const safeTranslatedCount = translatedCount ?? entries.filter((entry) => Boolean(entry.value && entry.value.trim() !== '')).length;
    const safeEmptyCount = Math.max(0, safeTotalEntries - safeTranslatedCount);
    const safeProgress = safeTotalEntries > 0 ? Math.round((safeTranslatedCount / safeTotalEntries) * 100) : 0;
    const safeModifiedCount = entries.filter((entry) => Boolean(entry.is_overridden)).length;
    const safeModifiedPercentage = safeTotalEntries > 0 ? Math.round((safeModifiedCount / safeTotalEntries) * 100) : 0;

    return {
        totalEntries: safeTotalEntries,
        translatedEntries: safeTranslatedCount,
        emptyEntries: safeEmptyCount,
        progressPercentage: safeProgress,
        modifiedEntries: safeModifiedCount,
        modifiedPercentage: safeModifiedPercentage,
    };
}
