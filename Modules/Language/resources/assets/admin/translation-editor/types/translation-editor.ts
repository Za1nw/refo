import type { TranslationEditorProps, TranslationEntryRow } from '../../types';

export type { TranslationEntryRow };
export type TranslationEditorPageProps = TranslationEditorProps;

export type TranslationEditorQuery = {
    locale: string;
    page: number;
    per_page: number;
    search?: string;
};

export type TranslationEditorState = {
    currentLocale: string;
    searchTerm: string;
    page: number;
    perPage: number;
    showSource: boolean;
    expandedKeys: string[];
    activeKey: string | null;
    requestCount: number;
    draftValuesByLocale: Record<string, Record<string, string>>;
    dirtyKeysByLocale: Record<string, string[]>;
};
