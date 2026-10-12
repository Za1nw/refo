import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontalIcon,
    PencilIcon,
    Trash2Icon,
    LanguagesIcon,
} from 'lucide-react';
import type { CellContext } from '@tanstack/react-table';
import type { LegacyFeatures } from '@tanstack/react-table/legacy';
import { useTranslation } from 'react-i18next';
import type { BlogCategory } from '../types/category';

export interface BlogCategoryRowActions {
    onEdit: (category: BlogCategory) => void;
    onDelete: (category: BlogCategory) => void;
    onTranslate?: (category: BlogCategory) => void;
}

export function blogCategoryActionsCell(actions: BlogCategoryRowActions) {
    return function BlogCategoryActionsComponent({ row }: CellContext<LegacyFeatures, BlogCategory, unknown>) {
        const { t } = useTranslation('blog');
        const category = row.original;

        return (
            <TableCell className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => actions.onEdit(category)}>
                            <PencilIcon className="me-2 h-4 w-4 text-primary" />
                            <span>{t('edit_category')}</span>
                        </DropdownMenuItem>

                        {actions.onTranslate && (
                            <DropdownMenuItem onClick={() => actions.onTranslate!(category)}>
                                <LanguagesIcon className="me-2 h-4 w-4 text-blue-500" />
                                <span>{t('translate_category')}</span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => actions.onDelete(category)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2Icon className="me-2 h-4 w-4" />
                            <span>{t('Delete')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        );
    };
}
