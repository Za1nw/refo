import { defaultTableEntryState } from './tableSlice.initialState';
import type {
    RowId,
    RowWithTransition,
    ServerPagination,
    TablePaginationState,
    TableRootState,
    TableSortingState,
} from './tableSlice.types';

/**
 * ===========================================================================
 * محددات حالة الجدول (Table Selectors)
 * ===========================================================================
 * دوال استعلامية عالية الأداء لقراءة أجزاء حالة الجدول عبر `tableId`.
 * توفر قيماً افتراضية آمنة في حال لم يكن الجدول مهيأ بعد في الـ Store.
 */

/** جلب نص البحث الحالي للجدول */
export function selectTableSearch(state: TableRootState, tableId: string): string {
    return state.table.tables[tableId]?.search ?? defaultTableEntryState.search;
}

/** جلب نمط العرض الحالي (table, cards, list) */
export function selectTableViewMode(state: TableRootState, tableId: string): string {
    return state.table.tables[tableId]?.viewMode ?? defaultTableEntryState.viewMode;
}

/** جلب الصف الفردي المحدد حالياً */
export function selectTableSelectedRow<T = unknown>(state: TableRootState, tableId: string): T | null {
    return (state.table.tables[tableId]?.selectedRow as T) ?? null;
}

/** جلب مصفوفة معرفات الصفوف المحددة للعمليات الجماعية */
export function selectTableSelectedRowIds(state: TableRootState, tableId: string): RowId[] {
    return state.table.tables[tableId]?.selectedRowIds ?? defaultTableEntryState.selectedRowIds;
}

/** فحص ما إذا كان صف محدد بالـ ID مختاراً حالياً (O(1) lookup) */
export function selectTableIsRowSelected(state: TableRootState, tableId: string, rowId: RowId): boolean {
    return Boolean(state.table.tables[tableId]?.selectedRowsMap?.[rowId]);
}

/** جلب عدد الصفوف المحددة جماعياً */
export function selectTableSelectedCount(state: TableRootState, tableId: string): number {
    return state.table.tables[tableId]?.selectedRowIds?.length ?? 0;
}

/** جلب مصفوفة بيانات الصفوف الحالية */
export function selectTableData<T = any>(state: TableRootState, tableId: string): RowWithTransition<T>[] {
    return (state.table.tables[tableId]?.data as RowWithTransition<T>[]) ?? defaultTableEntryState.data;
}

/** فحص حالة تحميل الجدول */
export function selectTableIsLoading(state: TableRootState, tableId: string): boolean {
    return state.table.tables[tableId]?.isLoading ?? defaultTableEntryState.isLoading;
}

/** جلب إعدادات الترقيم المحلي */
export function selectTablePagination(state: TableRootState, tableId: string): TablePaginationState {
    return state.table.tables[tableId]?.pagination ?? defaultTableEntryState.pagination;
}

/** جلب إعدادات الفرز الحالي */
export function selectTableSorting(state: TableRootState, tableId: string): TableSortingState {
    return state.table.tables[tableId]?.sorting ?? defaultTableEntryState.sorting;
}

/** جلب معلومات ترقيم السيرفر (meta + links) */
export function selectTableServerPagination(
    state: TableRootState,
    tableId: string,
): ServerPagination | null {
    return state.table.tables[tableId]?.serverPagination ?? defaultTableEntryState.serverPagination;
}

/**
 * فحص ما إذا كان الجدول قد تم تهيئته من السيرفر مسبقاً
 */
export function selectIsTableHydrated(state: TableRootState, tableId: string): boolean {
    return state.table.tables[tableId]?.serverPagination !== undefined && state.table.tables[tableId] !== undefined;
}

/**
 * فحص ما إذا كان الجدول فارغاً من البيانات
 */
export function selectIsTableEmpty(state: TableRootState, tableId: string): boolean {
    const data = state.table.tables[tableId]?.data;
    return !data || data.length === 0;
}

/**
 * جلب إجمالي عدد السجلات من السيرفر (أو طول المصفوفة كبديل)
 */
export function selectTableTotalRows(state: TableRootState, tableId: string): number {
    const serverMeta = state.table.tables[tableId]?.serverPagination?.meta;
    if (serverMeta?.total !== undefined) {
        return serverMeta.total;
    }
    return state.table.tables[tableId]?.data?.length ?? 0;
}
