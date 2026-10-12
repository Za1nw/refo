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
    EyeIcon,
} from 'lucide-react';
import type { CellContext } from '@tanstack/react-table';
import type { LegacyFeatures } from '@tanstack/react-table/legacy';
import { useTranslation } from 'react-i18next';
import type { Blog } from '../types/blog';

export interface BlogRowActions {
    onEdit: (blog: Blog) => void;
    onDelete: (blog: Blog) => void;
    onTranslate?: (blog: Blog) => void;
    onView?: (blog: Blog) => void;
}

export function blogActionsCell(actions: BlogRowActions) {
    return function BlogActionsComponent({ row }: CellContext<LegacyFeatures, Blog, unknown>) {
        const { t } = useTranslation('blog');
        const blog = row.original;

        return (
            <TableCell className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        {actions.onView && (
                            <DropdownMenuItem onClick={() => actions.onView!(blog)}>
                                <EyeIcon className="me-2 h-4 w-4 text-primary" />
                                <span>{t('View')}</span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => actions.onEdit(blog)}>
                            <PencilIcon className="me-2 h-4 w-4 text-primary" />
                            <span>{t('Edit')}</span>
                        </DropdownMenuItem>

                        {actions.onTranslate && (
                            <DropdownMenuItem onClick={() => actions.onTranslate!(blog)}>
                                <LanguagesIcon className="me-2 h-4 w-4 text-blue-500" />
                                <span>{t('Translate')}</span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => actions.onDelete(blog)}
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
