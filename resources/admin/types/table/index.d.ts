import type { RowData } from "@tanstack/react-table";
import type { LegacyCell as Cell, LegacyColumnDef as ColumnDef, LegacyReactTable as TanStackTable } from "@tanstack/react-table/legacy";
import type { ReactNode } from "react";

export type ExtendedColumnDef<TData extends RowData, TValue = any> = ColumnDef<TData, TValue> & {
    nonHideable?: boolean;
    label?: string;
};

export type ButtonsActions = {
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    onTranslate?: (item: any) => void;
    onView?: (item: any) => void;
    [key: string]: ((...args: any[]) => void) | undefined;
};

export interface ColumnLabels {
    label: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
    hidden?: boolean;
    render?: (value: any) => ReactNode;
    accessorFn?: (value: any) => any;
}

/**
 * Minimal column descriptor used by the reusable table components.
 * It maps 1:1 to TanStack column IDs used by `table.getColumn(id)`.
 */
export interface TableColumnDescriptor {
    accessorKey: string;
    nonHideable?: boolean;
}


export interface Links {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface MetaPagination {
    total: number,
    count: number,
    per_page: number,
    current_page: number,
    total_pages: number,
    sort_by: string | null,
    sort_order: 'asc' | 'desc' | null,
}

export interface TableProps {
    tableId: string;
    columns: TableColumnDescriptor[];
    table: TanStackTable<any>;
    isClient: boolean;
    /**
     * A consumer-provided object that may include optional hooks (e.g. a custom row skeleton renderer).
     * We keep it flexible because different pages attach extra behavior here.
     */
    initHook?: {
        /** Enable/disable sorting UI + server sorting requests. Defaults to true. */
        enableSorting?: boolean;
        rowSkeleton?: (
            visibleColumns: number[],
            columnCount: number,
            pageSize: number,
        ) => ReactNode;
        [key: string]: unknown;
    };
}



export interface RowsProps<TData extends RowData = RowData> {
    cell: Cell<TData, unknown> | null | undefined;
}


export interface TableCustomizeProps {
    children: ReactNode | ((visibleColumns: number[]) => ReactNode);
        columns?: TableColumnDescriptor[];
        className?: string;
}
