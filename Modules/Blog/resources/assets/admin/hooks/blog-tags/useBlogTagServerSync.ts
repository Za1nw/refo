import { useServerSync } from '@/features/table/hooks/useServerSync';
import tags from '@/routes/blog/tags';
import type { SortingState } from '@tanstack/react-table';

export function useBlogTagServerSync({
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
        getIndexUrl: () => tags.index().url,
        only: ['tags'],
    });

    return {
        syncFiltersFromUrl: sync.syncFiltersFromUrl,
        onSortingChange: sync.onSortingChange,
        searchData: sync.searchData,
        changePage: sync.changePage,
        changePageSize: sync.changePageSize,
    };
}
