import { useTableResources } from '@/features/table/hooks/useTableResource';
import { useBlogActions } from './useBlogActions';
import { useBlogColumns } from './useBlogColumns';
import { useBlogServerSync } from './useBlogServerSync';
import type { Blog } from '../../types/blog';

export function useTableBlog({ blogs }: { blogs: Pagination<Blog> }) {
    return useTableResources<Blog>({
        resources: blogs,
        tableId: 'blogs',
        useActions: useBlogActions,
        useColumns: useBlogColumns,
        useServerSync: useBlogServerSync,
    });
}
