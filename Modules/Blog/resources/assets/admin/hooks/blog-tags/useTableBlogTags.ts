import { useTableResources } from '@/features/table/hooks/useTableResource';
import { useBlogTagActions } from './useBlogTagActions';
import { useBlogTagColumns } from './useBlogTagColumns';
import { useBlogTagServerSync } from './useBlogTagServerSync';
import type { BlogTag } from '../../types/tag';

export function useTableBlogTags({ tags }: { tags: Pagination<BlogTag> }) {
    return useTableResources<BlogTag>({
        resources: tags,
        tableId: 'blog-tags',
        useActions: useBlogTagActions,
        useColumns: useBlogTagColumns,
        useServerSync: useBlogTagServerSync,
    });
}

export default useTableBlogTags;
