export interface BlogCategory {
    id: number;
    name: string;
    description: string | null;
    slug: string | null;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

export type BlogCategoryPayload = {
    name: string;
    description?: string;
    is_active?: boolean;
};

export type BlogCategoryTranslationPayload = {
    locale: string;
    name: string;
    description?: string;
};
