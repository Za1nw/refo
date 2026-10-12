import { useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useResourceActions } from '@/features/table/hooks/useResourceActions';
import { destroy, index } from '@/routes/blog';
import type { Blog } from '../../types/blog';

export function useBlogActions({ tableId, tableData }: { tableId: string; tableData: Blog[] }) {
    const { t } = useTranslation('blog');

    const resource = useResourceActions<Blog>({
        tableId,
        tableData,
        resourceName: t('blog'),
        getId: (x) => x.id,
        getName: (x) => x.title,
        destroyRoute: (id) => destroy(id),
    });

    const editRow = useCallback((blog: Blog) => {
        router.visit(`${index().url}/${blog.id}/edit`);
    }, []);

    const translateRow = useCallback((blog: Blog) => {
        router.visit(`${index().url}/${blog.id}/translate`);
    }, []);

    return {
        ...resource,
        editRow,
        translateRow,
    };
}
