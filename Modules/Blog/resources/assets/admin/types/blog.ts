import type { BlogCategory } from './category';
import type { BlogTag } from './tag';
import type { Image } from '@/types/image';

export interface Blog {
    id: number;
    slug: string;
    title: string;
    description: string;
    content: string;
    views: number;
    is_active: boolean;
    is_featured: boolean;
    readable_date?: string;
    category?: BlogCategory | null;
    tags?: BlogTag[];
    image?: Image | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type BlogPayload = {
    title: string;
    slug?: string;
    description: string;
    content: string;
    category_id?: number | string | null;
    tag_ids?: number[];
    is_active: boolean | number;
    is_featured: boolean | number;
    image?: File | null;
};

export type BlogTranslationPayload = {
    title?: string;
    description?: string;
    content?: string;
};

export interface BlogFilters {
    search: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    per_page: number;
    category_id?: string | number;
    status?: 'all' | 'active' | 'inactive';
}
