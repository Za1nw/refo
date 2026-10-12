import { type JSX, useState } from 'react';
import { useTableContext } from '@/context/TableContext';
import { selectTableData, tableActions } from '@/features/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ActionsButtons } from '../../actions-buttons';
import type { Blog } from '../../../types/blog';
import BlogEmptyState from './BlogEmptyState';

/**
 * عنصر القائمة الفردي للمدونة مع تفاعلات التعديل والحذف
 */
function BlogListItem({ blog }: { blog: Blog }) {
    const [removing, setRemoving] = useState(false);
    const [editing, setEditing] = useState(false);
    const { actions, tableId = 'blogs' } = useTableContext();
    const dispatch = useAppDispatch();

    const handleDelete = () => {
        setRemoving(true);
        setTimeout(() => {
            actions?.onDelete?.(blog);
        }, 300);
    };

    const handleEdit = () => {
        setEditing(true);
        setTimeout(() => {
            actions?.onEdit?.(blog);
        }, 220);
    };

    return (
        <div
            className={`relative rounded-xl border bg-card p-4 pr-14 text-start shadow-sm transition-transform duration-300 ${
                removing || editing ? 'pointer-events-none scale-95 opacity-0' : 'hover:-translate-y-0.5 hover:bg-accent/25'
            }`}
        >
            <button
                type="button"
                className="block w-full text-start"
                onClick={() => dispatch(tableActions.setSelectedRow({ tableId, row: blog }))}
            >
                <div className="font-medium text-foreground">{blog.title}</div>
                {blog.description ? (
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {blog.description}
                    </div>
                ) : null}
                {blog.category?.name ? (
                    <div className="mt-2 text-xs font-semibold text-primary">
                        {blog.category.name}
                    </div>
                ) : null}
            </button>
            <div className="absolute top-4 ltr:right-4 rtl:left-4">
                <ActionsButtons blog={blog} onDelete={handleDelete} onEdit={handleEdit} />
            </div>
        </div>
    );
}

/**
 * نمط العرض كقائمة رأسية (ListView):
 * يعرض سجلات المدونات على شكل بطاقات قائمة رأسية مبسطة مع دعم الحالة الفارغة.
 */
export default function BlogListView(): JSX.Element {
    const { tableId = 'blogs', onCreate } = useTableContext();
    const blogs = useAppSelector((state) => selectTableData(state, tableId) as Blog[]);

    return (
        <div className="flex flex-col gap-2">
            {blogs.length === 0 ? (
                <BlogEmptyState onCreate={onCreate} />
            ) : (
                blogs.map((blog) => <BlogListItem key={blog.id} blog={blog} />)
            )}
        </div>
    );
}
