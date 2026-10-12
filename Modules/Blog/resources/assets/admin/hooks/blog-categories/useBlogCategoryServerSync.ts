import { useServerSync } from '@/features/table/hooks/useServerSync';
import categories from '@/routes/blog/categories';
import type { SortingState } from '@tanstack/react-table';

export function useBlogCategoryServerSync({
    tableId,
    search,
    sorting,
    pageSize,
}: {
    tableId: string;
    search: string;
    sorting: SortingState;
    pageSize: number;
}) {
    const sync = useServerSync({
        tableId,
        search,
        sorting,
        pageSize,
        getIndexUrl: () => categories.index().url,
        only: ['categories'],
    });

    return {
        syncFiltersFromUrl: sync.syncFiltersFromUrl,
        onSortingChange: sync.onSortingChange,
        searchData: sync.searchData,
        changePage: sync.changePage,
        changePageSize: sync.changePageSize,
    };
}
