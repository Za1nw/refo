import type { ColumnLabels } from '@/types/table';
import type { Blog } from '../types/blog';

export function getBlogColumnLabels(t: (key: string) => string): Record<keyof Blog | string, ColumnLabels> {
    return {
        id: { label: t('column_id') },
        title: { label: t('column_title') },
        slug: { label: t('column_slug') },
        description: { label: t('column_description') },
        content: { label: t('column_content'), hidden: true },
        views: { label: t('column_views') },
        is_active: { label: t('column_is_active') },
        is_featured: { label: t('Featured'), hidden: true },
        tags: { label: t('column_tags') },
        category: { label: t('column_category') },
        created_at: { label: t('column_created_at') },
        updated_at: { label: t('column_updated_at'), hidden: true },
        actions: { label: t('column_actions') },
    };
}
