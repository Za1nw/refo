import type { Blog } from '../types/blog';
import type { useForm } from '@inertiajs/react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { createContext, useContext } from 'react';

export interface BlogFormData {
    slug: string;
    title: string;
    description: string;
    content: string;
    image: File | null;
    category_id: string | number;
    tag_ids?: number[];
    is_active: number | boolean;
    is_featured: number | boolean;
}

export interface BlogFormContextValue {
    mode: 'create' | 'edit';
    blog: Blog | null;
    form: ReturnType<typeof useForm<BlogFormData>>;

    t: (key: string) => string;
    tMain: (key: string) => string;
    processing: boolean;

    sensors: unknown;
    activeSectionId: string | null;
    overSectionId: string | null;
    lastDroppedSectionId: string | null;
    primarySections: Array<{ id: string; title: string; isShowTitle?: boolean; isShowDescription?: boolean }>;
    secondarySections: Array<{ id: string; title: string; isShowTitle?: boolean; isShowDescription?: boolean }>;

    submit: () => void;
    handleSectionDragCancel: () => void;
    handleSectionDragOver: (event: DragOverEvent) => void;
    handleSectionDragEnd: (event: DragEndEvent) => void;
    handleSectionDragStart: (event: DragStartEvent) => void;
    isSectionLocked: (id: string) => boolean;
}

export const BlogFormContext = createContext<BlogFormContextValue | null>(null);

export function useBlogFormContext(): BlogFormContextValue {
    const ctx = useContext(BlogFormContext);

    if (!ctx) {
        throw new Error('useBlogFormContext must be used within BlogFormProvider');
    }

    return ctx;
}
