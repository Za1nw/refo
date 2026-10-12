import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { Image } from "./image";

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface Blog {
    id: number;
    slug: string;
    title: string;
    description: string;
    content: string;
    views: number;
    is_active: boolean;
    is_featured: boolean;
    readable_date: string;
    category: Category;
    tags: Tag[];
    image: Image | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface UseTableBlogsProps {
    blogs: Blog[];
    columns: ColumnDef<Blog>[];
}
