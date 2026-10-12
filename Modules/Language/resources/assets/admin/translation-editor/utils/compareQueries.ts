import type { TranslationEditorQuery } from '../types/translation-editor';
import { normalizeTranslationQuery } from './normalizeTranslationQuery';

export function compareTranslationQueries(left: TranslationEditorQuery, right: TranslationEditorQuery): boolean {
    const normalizedLeft = normalizeTranslationQuery(left);
    const normalizedRight = normalizeTranslationQuery(right);

    return createQueryString(normalizedLeft) === createQueryString(normalizedRight);
}

export function createQueryString(query: TranslationEditorQuery): string {
    const normalized = normalizeTranslationQuery(query);
    const searchParams = new URLSearchParams();

    searchParams.set('locale', normalized.locale);
    searchParams.set('page', String(normalized.page));
    searchParams.set('per_page', String(normalized.per_page));

    if (normalized.search) {
        searchParams.set('search', normalized.search);
    }

    return searchParams.toString();
}
