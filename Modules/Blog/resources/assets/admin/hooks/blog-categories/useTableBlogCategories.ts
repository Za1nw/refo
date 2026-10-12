import { useTableResources } from '@/features/table/hooks/useTableResource';
import { useBlogCategoryActions } from './useBlogCategoryActions';
import { useBlogCategoryColumns } from './useBlogCategoryColumns';
import { useBlogCategoryServerSync } from './useBlogCategoryServerSync';
import type { BlogCategory } from '../../types/category';

export function useTableBlogCategories({ categories }: { categories: Pagination<BlogCategory> }) {
    return useTableResources<BlogCategory>({
        resources: categories,
        tableId: 'blog-categories',
        useActions: useBlogCategoryActions,
        useColumns: useBlogCategoryColumns,
        useServerSync: useBlogCategoryServerSync,
    });
}

export default useTableBlogCategories;
