export interface TranslationFileRow {
    namespace: string;
    group: string;
    label: string;
    text_count: number;
    edit_url: string;
}

export interface TranslationFilePaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface TranslationFilesIndexProps {
    files: {
        data: TranslationFileRow[];
        meta: TranslationFilePaginationMeta;
    };
    filters: {
        search: string;
        namespace: string;
        locale: string;
        per_page: number;
        page: number;
        sort_by: string;
        sort_order: string;
    };
    locales: string[];
    indexUrl: string;
}

export interface TranslationEntryRow {
    key: string;
    source_value: string;
    value: string;
    is_overridden?: boolean;
}

export interface TranslationEditorProps {
    file: {
        namespace: string;
        group: string;
        label: string;
    };
    locale: string;
    source_locale: string;
    edit_url: string;
    update_url: string;
    index_url: string;
    available_locales: string[];
    entries: TranslationEntryRow[];
    entries_meta?: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
    total_entries?: number;
    translated_count?: number;
    filters?: {
        search?: string;
        page?: number;
        per_page?: number;
    };
}

