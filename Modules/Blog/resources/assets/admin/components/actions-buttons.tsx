import { LanguagesIcon, MoreVertical, PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTableContext } from '@/context/TableContext';
import type { ButtonsActions } from '@/types/table';
import type { Blog } from '../types/blog';

export type BlogActions = {
    onEdit: NonNullable<ButtonsActions['onEdit']>;
    onDelete: NonNullable<ButtonsActions['onDelete']>;
    onTranslate?: NonNullable<ButtonsActions['onTranslate']>;
};

export function ActionsButtons({
    blog,
    onEdit,
    onDelete,
    onTranslate,
}: {
    blog: Blog;
    onEdit?: (b: Blog) => void;
    onDelete?: (b: Blog) => void;
    onTranslate?: (b: Blog) => void;
}) {
    const { actions } = useTableContext();
    const blogActions = actions as BlogActions | undefined;

    const call = {
        edit: (b: Blog) => {
            if (onEdit) return onEdit(b);
            return blogActions?.onEdit(b);
        },
        delete: (b: Blog) => {
            if (onDelete) return onDelete(b);
            return blogActions?.onDelete(b);
        },
        translate: (b: Blog) => {
            if (onTranslate) return onTranslate(b);
            return blogActions?.onTranslate?.(b);
        },
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="absolute top-4 ltr:right-4 rtl:left-4">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer rounded-md bg-primary/80 text-white duration-300 hover:bg-primary/50 hover:text-white"
                >
                    <MoreVertical className="size-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => call.edit(blog)}>
                        <PencilIcon className="me-2 h-4 w-4" />
                        تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => call.translate(blog)}>
                        <LanguagesIcon className="me-2 h-4 w-4" />
                        ترجمة
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => call.delete(blog)}
                        className="text-destructive focus:text-destructive"
                    >
                        <TrashIcon className="me-2 h-4 w-4" />
                        حذف
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
