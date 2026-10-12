import type { TranslationEditorQuery } from '../types/translation-editor';

export function normalizeTranslationQuery(query: TranslationEditorQuery): TranslationEditorQuery {
    const normalizedSearch = query.search?.trim();

    return {
        locale: String(query.locale).trim(),
        page: Math.max(1, Number(query.page) || 1),
        per_page: Math.max(1, Number(query.per_page) || 100),
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
    };
}
