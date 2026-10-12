import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { centeredTextCell, dateCell, descriptionCell, textCell } from '@/components/table';
import type { ExtendedColumnDef } from '@/types/table';
import type { BlogCategory } from '../../types/category';
import { blogSwitchCell } from '../../cells/blogSwitchCell';
import { blogCategoryActionsCell } from '../../cells/blogCategoryActionsCell';

export function useBlogCategoryColumns(actions: any) {
    const { editRow, deleteRow, translateRow, handleToggleActive } = actions;
    const { t } = useTranslation('blog');

    return useMemo((): ExtendedColumnDef<BlogCategory>[] => [
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
            accessorKey: 'description',
            header: () => t('column_description'),
            cell: descriptionCell,
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
            cell: blogCategoryActionsCell({
                onEdit: editRow,
                onDelete: deleteRow,
                onTranslate: translateRow,
            }),
        },
    ], [deleteRow, editRow, handleToggleActive, t, translateRow]);
}
