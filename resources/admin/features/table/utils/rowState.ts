import { Dispatch } from 'react';
import { tableActions } from '@/features/table';
import type { RowId, RowWithTransition } from '../tableSlice.types';

type AnyRow = Record<string, any> & { id?: RowId; slug?: string };

/**
 * دالة مساعدة لربط كائن صف بحالة انتقالية (created, updated, deleted)
 */
export function withRowState<T extends AnyRow>(item: T, state: 'created' | 'updated' | 'deleted'): RowWithTransition<T> {
    return { ...item, __row_state: state };
}

/**
 * إضافة صف تفاؤلي في أعلى الجدول مع أنيميشن `row-created`.
 */
export function addOptimisticRow<T extends AnyRow>(
    dispatch: Dispatch<any>,
    tableId: string,
    item: T,
    clearStateAfterMs = 1200,
) {
    const id = item.id ?? item.slug;
    dispatch(tableActions.addRow({ tableId, item, position: 'start', state: 'created' }));

    if (id !== undefined && clearStateAfterMs > 0) {
        setTimeout(() => {
            dispatch(tableActions.setRowState({ tableId, id, state: null }));
        }, clearStateAfterMs);
    }
}

/**
 * تحديث بيانات صف مع تطبيق تأثير الحركة `row-updated` وإزالتها تلقائياً بعد انقضاء الوقت المحدد.
 */
export function markRowUpdated<T extends AnyRow>(
    dispatch: Dispatch<any>,
    tableId: string,
    item: T,
    clearAfterMs = 800,
) {
    const id = item.id ?? item.slug;
    if (id === undefined) {
        return;
    }

    dispatch(tableActions.updateRow({ tableId, id, changes: item, state: 'updated' }));

    if (clearAfterMs > 0) {
        setTimeout(() => {
            dispatch(tableActions.setRowState({ tableId, id, state: null }));
        }, clearAfterMs);
    }
}

/**
 * وسم صف بالحالة `row-deleted` لإعطاء تأثير تلاشي قبل إزالته نهائياً من الـ Store.
 */
export function markRowDeleted(
    dispatch: Dispatch<any>,
    tableId: string,
    id: RowId,
    removeAfterMs = 420,
) {
    dispatch(tableActions.setRowState({ tableId, id, state: 'deleted' }));

    setTimeout(() => {
        dispatch(tableActions.removeRow({ tableId, id }));
    }, removeAfterMs);
}

export default {
    withRowState,
    addOptimisticRow,
    markRowUpdated,
    markRowDeleted,
};
