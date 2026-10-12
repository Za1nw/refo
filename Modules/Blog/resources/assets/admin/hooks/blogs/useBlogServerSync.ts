import { FilterConfig, useServerSync } from '@/features/table/hooks/useServerSync';
import { index } from '@/routes/blog';
import type { SortingState } from '@tanstack/react-table';

type StatusFilterValue = 'all' | 'active' | 'inactive';

const STATUS_FILTER: FilterConfig<'status'> = {
    key: 'status',
    param: 'status',
    emptyValue: 'all',
    allowedValues: ['active', 'inactive'],
};

const CATEGORY_FILTER: FilterConfig<'category_id'> = {
    key: 'category_id',
    param: 'category_id',
    emptyValue: 'all',
};

const FILTERS = [STATUS_FILTER, CATEGORY_FILTER];

export function useBlogServerSync({
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
        getIndexUrl: () => index().url,
        only: ['blogs'],
        filters: FILTERS,
    });

    return {
        statusFilter: (sync.filterValues.status as StatusFilterValue) || 'all',
        categoryFilter: (sync.filterValues.category_id as string) || 'all',
        filterByStatus: (next: StatusFilterValue) => sync.setFilter('status', next),
        filterByCategory: (next: string) => sync.setFilter('category_id', next),
        syncFiltersFromUrl: sync.syncFiltersFromUrl,
        onSortingChange: sync.onSortingChange,
        searchData: sync.searchData,
        changePage: sync.changePage,
        changePageSize: sync.changePageSize,
    };
}
