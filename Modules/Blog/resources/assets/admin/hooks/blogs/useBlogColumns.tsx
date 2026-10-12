import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { centeredTextCell, dateCell, descriptionCell, textCell } from '@/components/table';
import type { ExtendedColumnDef } from '@/types/table';
import type { Blog } from '../../types/blog';
import { blogCell } from '../../cells/blogCell';
import { blogActionsCell } from '../../cells/blogActionsCell';

export function useBlogColumns(actions: any) {
    const { editRow, deleteRow, translateRow } = actions;
    const { t } = useTranslation('blog');

    return useMemo((): ExtendedColumnDef<Blog>[] => [
        {
            accessorKey: 'id',
            header: () => t('column_id'),
            nonHideable: true,
            cell: centeredTextCell,
        },
        {
            accessorKey: 'title',
            header: () => t('column_title'),
            cell: blogCell,
        },
        {
            accessorKey: 'description',
            header: () => t('column_excerpt'),
            cell: descriptionCell,
        },
        {
            accessorKey: 'slug',
            header: () => t('column_slug'),
            cell: textCell,
        },
        {
            accessorKey: 'created_at',
            header: () => t('column_created_at'),
            cell: dateCell(),
        },
        {
            accessorKey: 'actions',
            header: () => t('column_actions'),
            nonHideable: true,
            enableSorting: false,
            cell: blogActionsCell({
                onEdit: editRow,
                onDelete: deleteRow,
                onTranslate: translateRow,
            }),
        },
    ], [deleteRow, editRow, t, translateRow]);
}
