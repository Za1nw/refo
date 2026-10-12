import { AppDispatch } from '@/store/store';
import { tableActions } from '@/features/table';
import { addOptimisticRow, markRowDeleted, markRowUpdated } from './rowState';
import type { RowId } from '../tableSlice.types';

interface BaseRow {
    id?: RowId;
    slug?: string;
    [key: string]: any;
}

/**
 * دالة مصنع كائن عمليات الصفوف (`createTableRows`):
 *
 * توفر واجهة نقية ومستقرة مرجعياً لإدارة صفوف الجدول في Redux Store:
 * - إضافة صف جديد بتأثير حركي (`add`).
 * - تحديث صف قائم بتأثير حركي (`update`).
 * - حذف صف بتأثير تلاشٍ تدريجي (`remove`).
 * - التحديد الفردي والجماعي للصفوف (`toggleSelect`, `selectAll`, `clearSelection`).
 */
export function createTableRows<T extends BaseRow>(
    dispatch: AppDispatch,
    tableId: string,
    _tableData?: T[],
) {
    return {
        /** إضافة صف جديد في أعلى الجدول */
        add(item: T): void {
            addOptimisticRow(dispatch, tableId, item);
        },

        /** تحديث بيانات صف موجود */
        update(item: T): void {
            markRowUpdated(dispatch, tableId, item);
        },

        /** حذف صف بالمعرّف مع أنيميشن التلاشي */
        remove(id: RowId): void {
            markRowDeleted(dispatch, tableId, id);
        },

        /** تبديل تحديد صف فردي */
        toggleSelect(id: RowId): void {
            dispatch(tableActions.toggleSelectRow({ tableId, id }));
        },

        /** تحديد كافة الصفوف المعروضة */
        selectAll(): void {
            dispatch(tableActions.selectAllRows({ tableId }));
        },

        /** إلغاء التحديد الجماعي */
        clearSelection(): void {
            dispatch(tableActions.clearRowSelection({ tableId }));
        },
    };
}

export type TableRows<T extends BaseRow = BaseRow> = ReturnType<typeof createTableRows<T>>;
