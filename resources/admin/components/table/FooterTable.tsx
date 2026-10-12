import type { RowData } from '@tanstack/react-table';
import type { LegacyReactTable as TanStackTableInstance } from '@tanstack/react-table/legacy';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { selectTableServerPagination } from '@/features/table';

import { useAppSelector } from '@/store/hooks';

import { ServerPagination } from '@/features/table';
import ServerPaginationFooterTable from './ServerPaginationFooterTable';

interface FooterTableProps<TData extends RowData> {
    table: TanStackTableInstance<TData>;
    tableId?: string;
}

/** شكل بيانات الـ meta الإضافية التي قد يمررها الجدول عند الترقيم اليدوي (Server-side) */
interface ManualPaginationTableMeta {
    pagination?: ServerPagination;
    onChangePage?: (url: string | null) => void;
    onChangePageSize?: (size: number, path: string) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

/**
 * تذييل الجدول الموحّد. يدعم حالتين مختلفتين تمامًا:
 *
 * 1) ترقيم يدوي (manualPagination = true): البيانات والترقيم يأتيان من
 *    السيرفر، فنعرض `ServerPaginationFooterTable` ونعتمد على Redux
 *    (serverPagination) أو meta الممرّرة في خيارات الجدول كمصدر بديل.
 *
 * 2) ترقيم محلي (manualPagination = false): tanstack/react-table يتحكم
 *    بالترقيم بنفسه على البيانات الموجودة في الذاكرة، فنعرض تذييلًا مبسطًا
 *    يعتمد فقط على واجهة الجدول (table.setPageIndex...).
 */
export default function FooterTable<TData extends RowData>({
    table,
    tableId,
}: FooterTableProps<TData>) {
    const paginationState = table.getState?.().pagination;
    const pageIndex = paginationState?.pageIndex ?? 0;
    const pageSize = paginationState?.pageSize ?? 10;
    const reduxPagination = useAppSelector((state) =>
        tableId ? selectTableServerPagination(state, tableId) : null,
    );
    if (table.options.manualPagination) {
        return renderManualPaginationFooter(table, reduxPagination);
    }

    if (!paginationState) {
        return null;
    }

    return renderLocalPaginationFooter(table, pageIndex, pageSize);
}

/** يعرض تذييل الترقيم الخاص بالسيرفر (أو لا شيء إن لم تتوفر بيانات كافية) */
function renderManualPaginationFooter<TData extends RowData>(
    table: TanStackTableInstance<TData>,
    reduxPagination: ServerPagination | null,
) {
    const meta = table.options.meta as ManualPaginationTableMeta | undefined;
    // نُفضّل بيانات Redux (مصدر الحقيقة)، ونرجع إلى meta كخيار احتياطي فقط
    const serverPagination = reduxPagination ?? meta?.pagination;
    const onPageChange = meta?.onChangePage;

    if (!serverPagination || typeof onPageChange !== 'function') {
        return null;
    }

    return (
        <ServerPaginationFooterTable
            pagination={serverPagination}
            onPageChange={onPageChange}
            onPageSizeChange={meta?.onChangePageSize}
        />
    );
}

/** يعرض تذييل ترقيم محلي بسيط يعتمد فقط على واجهة tanstack/react-table */
function renderLocalPaginationFooter<TData extends RowData>(
    table: TanStackTableInstance<TData>,
    pageIndex: number,
    pageSize: number,
) {
    return (
        <div className="flex items-center justify-between px-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                {pageSize * (pageIndex + 1)} من{' '}
                {table.getFilteredRowModel().rows.length} صف(وف) محدد.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label
                        htmlFor="rows-per-page"
                        className="text-sm font-medium"
                    >
                        الصفوف لكل صفحة
                    </Label>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) =>
                            table.setPageSize(Number(value))
                        }
                    >
                        <SelectTrigger className="w-20" id="rows-per-page">
                            <SelectValue placeholder={pageSize.toString()} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    الصفحة {pageIndex + 1} من {table.getPageCount()}
                </div>
                <div className="rtl:rtl ml-auto flex items-center gap-2 lg:ml-0 rtl:flex-row-reverse">
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">
                            الانتقال إلى الصفحة الأولى
                        </span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">
                            الانتقال إلى الصفحة السابقة
                        </span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">
                            الانتقال إلى الصفحة التالية
                        </span>
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">
                            الانتقال إلى الصفحة الأخيرة
                        </span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
