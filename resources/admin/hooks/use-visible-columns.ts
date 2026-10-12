import { RefObject, useEffect, useState } from "react";

interface ColumnLike {
    nonHideable?: boolean;
}

interface UseVisibleColumnsOptions {
    columnWidth?: number;
}

export function useVisibleColumns(
    tableRef: RefObject<HTMLElement | null>,
    columns: ColumnLike[],
    options: UseVisibleColumnsOptions = {},
): number[] {
    const [visibleColumns, setVisibleColumns] = useState<number[]>(() =>
        columns.map((_, index) => index),
    );

    useEffect(() => {
        const table = tableRef.current;

        if (!table) {
            return;
        }

        const columnWidth = options.columnWidth ?? 120;

        if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
            setVisibleColumns(columns.map((_, index) => index));
            return;
        }

        const computeVisible = () => {
            const tableWidth = table.clientWidth;
            const maxVisibleColumns = Math.max(1, Math.floor(tableWidth / columnWidth));

            const nonHideableColumns = columns
                .map((col, index) => (col.nonHideable ? index : null))
                .filter((index): index is number => index !== null);

            const newVisible: number[] = [...nonHideableColumns];

            for (let index = 0; index < columns.length; index++) {
                if (newVisible.length >= maxVisibleColumns) {
                    break;
                }

                if (!newVisible.includes(index)) {
                    newVisible.push(index);
                }
            }

            newVisible.sort((a, b) => a - b);
            setVisibleColumns(newVisible);
        };

        const resizeObserver = new ResizeObserver(computeVisible);
        resizeObserver.observe(table);

        window.addEventListener("resize", computeVisible);
        computeVisible();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", computeVisible);
        };
    }, [tableRef, columns, options.columnWidth]);

    return visibleColumns;
}
