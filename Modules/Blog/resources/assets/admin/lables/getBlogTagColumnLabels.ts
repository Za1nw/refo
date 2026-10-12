import type { ColumnLabels } from '@/types/table';
import type { BlogTag } from '../types/tag';

export function getBlogTagColumnLabels(t: (key: string) => string): Record<keyof BlogTag | string, ColumnLabels> {
    return {
        id: { label: t('column_id') },
        name: { label: t('column_name') },
        slug: { label: t('column_slug') },
        is_active: { label: t('column_is_active') },
        created_at: { label: t('column_created_at') },
        updated_at: { label: t('column_updated_at'), hidden: true },
        actions: { label: t('column_actions') },
    };
}
