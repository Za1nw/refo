export interface BlogTag {
    id: number;
    name: string;
    slug: string | null;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

export type BlogTagPayload = {
    name: string;
    is_active?: boolean;
};

export type BlogTagTranslationPayload = {
    locale: string;
    name: string;
};
