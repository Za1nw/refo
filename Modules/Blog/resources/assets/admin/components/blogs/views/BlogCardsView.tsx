import type { JSX } from 'react';
import { useTableContext } from '@/context/TableContext';
import { selectTableData } from '@/features/table';
import { useAppSelector } from '@/store/hooks';
import BlogCard from '../../blog-card';
import type { Blog } from '../../../types/blog';
import BlogEmptyState from './BlogEmptyState';

/**
 * نمط العرض كشبكة كروت (Cards / Grid View):
 * يعرض سجلات المدونات كبطاقات صور جميلة ومتجاوبة ضمن شبكة Grid.
 */
export default function BlogCardsView(): JSX.Element {
    const { tableId = 'blogs', onCreate } = useTableContext();
    const blogs = useAppSelector((state) => selectTableData(state, tableId) as Blog[]);

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3 @5xl:grid-cols-4">
                {blogs.length === 0 ? (
                    <BlogEmptyState onCreate={onCreate} />
                ) : (
                    blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
                )}
            </div>
        </div>
    );
}
