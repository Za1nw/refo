import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTableContext } from '@/context/TableContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { tableActions } from '@/features/table';
import { useAppDispatch } from '@/store/hooks';
import { useCallback, useState } from 'react';
import { ActionsButtons } from './actions-buttons';
import type { Blog } from '../types/blog';

export default function BlogCard({ blog }: { blog: Blog }) {
    const dispatch = useAppDispatch();
    const { tableId, actions } = useTableContext();
    const [isRemoving, setIsRemoving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleDeleteAnimated = useCallback(() => {
        setIsRemoving(true);
        setTimeout(() => {
            dispatch(tableActions.setSelectedRow({ tableId: tableId ?? 'blogs', row: blog }));
            actions?.onDelete?.(blog);
        }, 320);
    }, [dispatch, blog, tableId, actions]);

    const handleEditAnimated = useCallback(() => {
        setIsEditing(true);
        setTimeout(() => {
            dispatch(tableActions.setSelectedRow({ tableId: tableId ?? 'blogs', row: blog }));
            actions?.onEdit?.(blog);
            setIsEditing(false);
        }, 220);
    }, [actions, dispatch, blog, tableId]);

    return (
        <Card
            className={`max-w-sm overflow-hidden rounded-xl border bg-card p-0! text-start shadow-sm transition-transform duration-300 ${
                isRemoving ? 'pointer-events-none scale-95 opacity-0' : 'hover:-translate-y-0.5 hover:bg-accent/25'
            }`}
        >
            <CardHeader className="relative flex items-center gap-4 p-0">
                {blog.image?.medium && (
                    <div className="group w-full max-w-sm overflow-hidden">
                        <AspectRatio ratio={3 / 2} className="bg-muted">
                            <img
                                src={blog.image.medium}
                                alt={blog.title}
                                className={`w-full object-cover transition duration-300 dark:brightness-90 ${
                                    isEditing ? 'scale-105' : 'group-hover:scale-110'
                                }`}
                            />
                        </AspectRatio>
                        {blog.category?.name && (
                            <span className="absolute top-4 rounded-full bg-background/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-lg ring-1 ring-white/20 backdrop-blur-sm ltr:left-4 rtl:right-4">
                                {blog.category.name}
                            </span>
                        )}
                        <ActionsButtons blog={blog} onDelete={handleDeleteAnimated} onEdit={handleEditAnimated} />
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-5 py-3">
                <div className="space-y-2.5">
                    <h3 className="text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                        <a href="#">{blog.title}</a>
                    </h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {blog.description}
                    </p>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {blog.created_at && (
                            <span className="inline-flex items-center gap-1.5 transition-transform group-hover:text-primary/80">
                                <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{blog.created_at}</span>
                            </span>
                        )}
                        {blog.readable_date && (
                            <span className="inline-flex items-center gap-1.5 transition-transform group-hover:text-primary/80">
                                <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{blog.readable_date}</span>
                            </span>
                        )}
                    </div>

                    <div className="relative z-10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch(tableActions.setSelectedRow({ tableId: tableId ?? 'blogs', row: blog }))}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                        >
                            <span>عرض</span>
                            <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
