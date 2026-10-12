import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { centeredTextCell, dateCell, textCell } from '@/components/table';
import type { ExtendedColumnDef } from '@/types/table';
import type { BlogTag } from '../../types/tag';
import { blogSwitchCell } from '../../cells/blogSwitchCell';
import { blogTagActionsCell } from '../../cells/blogTagActionsCell';

export function useBlogTagColumns(actions: any) {
    const { editRow, deleteRow, translateRow, handleToggleActive } = actions;
    const { t } = useTranslation('blog');

    return useMemo((): ExtendedColumnDef<BlogTag>[] => [
        {
            accessorKey: 'id',
            header: () => t('column_id'),
            nonHideable: true,
            cell: centeredTextCell,
        },
        {
            accessorKey: 'name',
            header: () => t('column_name'),
            cell: textCell,
        },
        {
            accessorKey: 'slug',
            header: () => t('column_slug'),
            cell: textCell,
        },
        {
            accessorKey: 'is_active',
            header: () => t('column_is_active'),
            cell: blogSwitchCell(handleToggleActive),
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
            cell: blogTagActionsCell({
                onEdit: editRow,
                onDelete: deleteRow,
                onTranslate: translateRow,
            }),
        },
    ], [deleteRow, editRow, handleToggleActive, t, translateRow]);
}
