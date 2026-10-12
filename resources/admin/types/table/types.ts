export type TableSortingState = Array<{ id: string; desc: boolean }>;

export type TableRow = Record<string, any>;

export interface TableEntryState<T = TableRow> {
    search: string;
    viewMode: string;
    selectedRow: T | null;
    data: T[];
    isLoading: boolean;

    pagination: {
        pageIndex: number;
        pageSize: number;
    };

    sorting: TableSortingState;

    serverPagination: {
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: { url: string | null; label: string; active: boolean }[];
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    } | null;
}

export interface TableSliceState {
    tables: Record<string, TableEntryState<any> | undefined>;
}

export interface TableRootState {
    table: TableSliceState;
}
