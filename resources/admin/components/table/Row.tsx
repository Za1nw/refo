import type { RowData } from '@tanstack/react-table';
import type { LegacyCell as Cell } from "@tanstack/react-table/legacy";
import { flexRender } from "@tanstack/react-table";
import { memo, type ReactNode } from "react";

export interface RowProps<TData extends RowData = RowData> {
    cell: Cell<TData, unknown> | null | undefined;
}

/**
 * يعرض خلية واحدة من جدول tanstack/react-table باستخدام `flexRender`.
 * عادةً ما تُرجع دوال عرض الخلايا في هذا المشروع عنصر `<TableCell />`
 * جاهزًا، وهذا المكوّن لا يضيف أي تنسيق إضافي حول الخلية.
 *
 * ملفوف بـ memo لتجنّب إعادة تصيير الخلية إذا لم يتغيّر مرجع `cell` نفسه،
 * وهذا مهم في الجداول الكبيرة حيث قد يكون لديك مئات الخلايا في كل صفحة.
 */
function Row<TData extends RowData>({ cell }: RowProps<TData>): ReactNode {
    if (!cell) {
        return null;
    }

    return flexRender(cell.column.columnDef.cell, cell.getContext()) ?? null;
}

export default memo(Row) as typeof Row;
