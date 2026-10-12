import type { TranslationEditorQuery } from '../types/translation-editor';
import { normalizeTranslationQuery } from './normalizeTranslationQuery';

export function buildTranslationQuery(query: TranslationEditorQuery): TranslationEditorQuery {
    return normalizeTranslationQuery(query);
}
