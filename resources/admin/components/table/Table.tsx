import { flexRender } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { JSX } from "react";

import { Card } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { selectTableData, selectTableIsLoading, selectTablePagination, tableActions } from "@/features/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TableProps } from "@/types/table";

import FooterTable from "./FooterTable";
import Row from "./Row";
import RowSkeleton from "./RowSkeleton";
import { TableButton, TableCustomize } from "./table-customize";

type SortDirection = "asc" | "desc" | false;

/** يحدد أيقونة السهم المعروضة بجانب اسم العمود حسب اتجاه الفرز الحالي */
function getSortIcon(direction: SortDirection): JSX.Element | null {
    if (direction === "asc") {
        return <ChevronDownIcon size={15} />;
    }

    if (direction === "desc") {
        return <ChevronUpIcon size={15} />;
    }

    return null;
}

/**
 * يستخرج معرّف الصف الأول من بيانات Redux (id أو slug)، يُستخدم فقط
 * كجزء من مفتاح (key) إعادة تصيير جسم الجدول (tableBodyKey) لضمان أن
 * React يعيد بناء الصفوف عند تغيّر البيانات فعليًا (وليس فقط طول المصفوفة).
 */
function getFirstRowIdentifier(rows: unknown[]): string | number | null {
    const first = rows?.[0];

    if (!first || typeof first !== "object") {
        return null;
    }

    const candidate = first as Record<string, unknown>;
    return (candidate.id as string | number | undefined) ?? (candidate.slug as string | number | undefined) ?? null;
}

/** يجلب خلية عمود معيّن من صف tanstack/react-table بأمان (دعم واجهتين مختلفتين) */
function getCellFromRow(row: any, columnId: string): any {
    if (!row) {
        return null;
    }

    if (typeof row.getCell === "function") {
        return row.getCell(columnId);
    }

    const cells = typeof row.getVisibleCells === "function" ? row.getVisibleCells() : row.getAllCells?.();
    return Array.isArray(cells) ? cells.find((cell: any) => cell?.column?.id === columnId) : null;
}

/**
 * يبحث عن عنصر الهيدر (header) المطابق لعمود معيّن ضمن كل الهيدرات
 * المسطّحة (flat headers) للجدول، متجاهلًا الهيدرات الوهمية (placeholders).
 */
function getHeaderForColumnId(table: any, columnId: string): any {
    const flatHeaders = typeof table?.getFlatHeaders === "function" ? table.getFlatHeaders() : [];
    return Array.isArray(flatHeaders)
        ? flatHeaders.find((header: any) => header?.column?.id === columnId && !header?.isPlaceholder)
        : null;
}

/**
 * يحدد كلاس CSS الخاص بحالة الصف "الانتقالية" (مضاف حديثًا/مُعدَّل/سيُحذف)،
 * بناءً على حقل داخلي `__row_state` يضيفه منطق التحديث المحلي للجدول
 * (مثلًا بعد إضافة عنصر جديد عبر toast.promise قبل إعادة الجلب من السيرفر).
 */
function getRowStateClassName(original: unknown): string {
    if (!original || typeof original !== "object") {
        return "";
    }

    const state = (original as Record<string, unknown>).__row_state;

    if (state === "created") {
        return "row-created";
    }

    if (state === "updated") {
        return "row-updated";
    }

    if (state === "deleted") {
        return "row-deleted";
    }

    return "";
}

/**
 * مكوّن الجدول العام القابل لإعادة الاستخدام، مبني فوق tanstack/react-table.
 *
 * نقاط مهمة:
 * - إظهار/إخفاء الأعمدة يتم التحكم به عبر `TableCustomize` بناءً على
 *   مصفوفة الأعمدة التي يوفّرها المستهلك (consumer) ومساحة الشاشة المتاحة.
 * - تفاصيل الصف المحدد (لفتح نافذة العرض) تُدار عبر Redux (`tableSlice`)
 *   باستخدام `tableId` كمفتاح.
 * - أثناء التحميل (isLoading)، نعرض هيكلًا وهميًا (Skeleton) بدل الصفوف
 *   الحقيقية، مع إمكانية تخصيص هذا الهيكل عبر initHook.rowSkeleton.
 */
function Table({ tableId, columns, table, isClient, initHook }: TableProps): JSX.Element | null {
    const dispatch = useAppDispatch();
    const enableSorting = initHook?.enableSorting ?? true;

    const reduxPagination = useAppSelector((state) => selectTablePagination(state, tableId));
    const reduxData = useAppSelector((state) => selectTableData(state, tableId));
    const isLoading = useAppSelector((state) => selectTableIsLoading(state, tableId));

    const pageIndex = reduxPagination.pageIndex ?? 0;
    const pageSize = reduxPagination.pageSize ?? 10;

    // مفتاح فريد لجسم الجدول يضمن إعادة التصيير الصحيحة عند تغيّر الصفحة
    // أو حجمها أو أول صف في البيانات (إشارة قوية لتغيّر فعلي في المحتوى)
    const firstReduxRowIdentifier = getFirstRowIdentifier(reduxData);
    const tableBodyKey = `${tableId}-${pageIndex}-${pageSize}-${firstReduxRowIdentifier ?? "none"}-${reduxData?.length ?? 0}`;

    const customRowSkeleton = typeof initHook?.rowSkeleton === "function" ? initHook.rowSkeleton : null;


    // لا نُصيِّر شيئًا قبل أن نتأكد أننا في بيئة المتصفح (تجنب اختلاف SSR/CSR)
    if (!isClient) {
        return null;
    }

    const tableMeta = table?.options?.meta as any;
    const getRowClassName = typeof tableMeta?.getRowClassName === "function" ? tableMeta.getRowClassName : null;

    // نفعّل كلاسات الحركة (animation) فقط إذا كان هناك صف واحد على الأقل
    // بحالة انتقالية، أو إذا زوّد المستهلك دالة getRowClassName خاصة به
    const hasAnimatedRow = Array.isArray(reduxData) && reduxData.some((row) => getRowStateClassName(row) !== "");
    const tableCustomizeAnimationClasses =
        getRowClassName || hasAnimatedRow ? "overflow-x-hidden hover:*:overflow-x-hidden!" : "";


    return (
        <>
            <Card className="shadow-md rounded-lg border p-0 overflow-hidden mb-4 scrollbar">
                <TableCustomize
                    className={`shadow-md rounded-lg border scrollbar ${tableCustomizeAnimationClasses}`}
                    columns={columns}
                >
                    {(visibleColumns: number[]) => (
                        <>
                            <TableHeader>
                                <TableRow className="bg-accent/35">
                                    {/* عمود التفاصيل/التحديد، يُخفى تلقائيًا إذا كانت كل الأعمدة مرئية */}
                                    <TableHead
                                        className={"p-1 " + (visibleColumns.length === columns.length ? "hidden" : "")}
                                    />
                                    {visibleColumns.map((colIndex) => {
                                        const colDescriptor = columns[colIndex] as any;
                                        const columnId = colDescriptor?.accessorKey ?? colDescriptor?.id;
                                        const header = columnId ? getHeaderForColumnId(table, columnId) : null;
                                        const column = header?.column ?? (columnId ? table.getColumn(columnId) : null);

                                        const canSort = enableSorting && !!column?.getCanSort?.();
                                        const sortDirection = (column?.getIsSorted?.() ?? false) as SortDirection;

                                        return (
                                            <TableHead
                                                key={columnId ?? colIndex}
                                                className={"border text-center " + (canSort ? "cursor-pointer" : "")}
                                                onClick={() => {
                                                    if (!canSort) {
                                                        return;
                                                    }
                                                    column?.toggleSorting?.();
                                                }}
                                            >
                                                <div className="flex p-2 gap-1 items-center justify-center font-bold">
                                                    {header
                                                        ? flexRender(header.column.columnDef.header, header.getContext())
                                                        : column?.columnDef?.header ?? null}
                                                    {canSort ? getSortIcon(sortDirection) : null}
                                                </div>
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            </TableHeader>

                            <TableBody key={tableBodyKey}>
                                {isLoading
                                    ? (customRowSkeleton ?? RowSkeleton)(
                                        visibleColumns,
                                        visibleColumns.length + (visibleColumns.length === columns.length ? 0 : 1),
                                        pageSize,
                                    )
                                    : table.getRowModel().rows.map((row: any, rowIndex: number) => {
                                        const rowKey = row?.original?.id ?? row?.original?.slug ?? row?.id ?? rowIndex;
                                        const isAllColumnsVisible = visibleColumns.length === columns.length;

                                        // أولوية كلاس الحركة لدالة المستهلك المخصصة، وإلا نستخدم الحالة
                                        // الافتراضية المستخرجة من __row_state
                                        const defaultRowClassName = getRowStateClassName(row?.original);
                                        const extraRowClassName = getRowClassName
                                            ? String(getRowClassName(row?.original, row) ?? "")
                                            : defaultRowClassName;
                                        const animationBaseClass =
                                            getRowClassName || defaultRowClassName
                                                ? "will-change-transform motion-safe:transition-colors"
                                                : "";

                                        return (
                                            <TableRow
                                                key={rowKey}
                                                className={`odd:bg-accent/25 ${animationBaseClass} ${extraRowClassName}`}
                                            >
                                                <TableButton
                                                    onClick={() =>
                                                        dispatch(
                                                            tableActions.setSelectedRow({
                                                                tableId,
                                                                row: row.original,
                                                            }),
                                                        )
                                                    }
                                                    hidden={isAllColumnsVisible ? "hidden" : ""}
                                                />
                                                {visibleColumns.map((colIndex) => {
                                                    const colDescriptor = columns[colIndex] as any;
                                                    const colId = colDescriptor?.accessorKey ?? colDescriptor?.id;

                                                    if (!colId) {
                                                        return null;
                                                    }

                                                    const cell = getCellFromRow(row, colId);

                                                    return <Row key={`${rowKey}-${colId}`} cell={cell} />;
                                                })}
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </>
                    )}
                </TableCustomize>
            </Card>

            <FooterTable tableId={tableId} table={table} />
        </>
    );
}

export default Table;
