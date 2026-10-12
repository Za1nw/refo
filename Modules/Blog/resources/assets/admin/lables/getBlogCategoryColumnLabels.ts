import type { ColumnLabels } from '@/types/table';
import type { BlogCategory } from '../types/category';

export function getBlogCategoryColumnLabels(t: (key: string) => string): Record<keyof BlogCategory | string, ColumnLabels> {
    return {
        id: { label: t('column_id') },
        name: { label: t('column_name') },
        description: { label: t('column_description') },
        slug: { label: t('column_slug') },
        is_active: { label: t('column_is_active') },
        created_at: { label: t('column_created_at') },
        updated_at: { label: t('column_updated_at'), hidden: true },
        actions: { label: t('column_actions') },
    };
}
