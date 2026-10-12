import type { CellContext } from '@tanstack/react-table';
import type { LegacyFeatures } from '@tanstack/react-table/legacy';
import { TableCell } from '@/components/ui/table';
import type { Blog } from '../types/blog';

export function blogCell({ row }: CellContext<LegacyFeatures, Blog, unknown>) {
    const blog = row.original;

    return (
        <TableCell className="text-start">
            <div className="flex items-center gap-3">
                {blog.image?.thumb_hd || blog.image?.thumb || blog.image?.medium ? (
                    <img
                        src={blog.image.thumb_hd || blog.image.thumb || blog.image.medium}
                        alt={blog.title}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover border"
                    />
                ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-xs font-semibold text-muted-foreground">
                        {blog.title.slice(0, 2).toUpperCase()}
                    </div>
                )}

                <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm text-foreground truncate max-w-xs">{blog.title}</span>
                    {blog.category?.name && (
                        <span className="text-xs text-muted-foreground truncate">{blog.category.name}</span>
                    )}
                </div>
            </div>
        </TableCell>
    );
}

export default blogCell;
