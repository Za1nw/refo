import type { TableEntryState, TableSliceState } from './tableSlice.types';

/**
 * دالة توليد الحالة الافتراضية لجدول واحد (Factory Function):
 * تُنشئ كائن حالة جديد ومستقل تماماً لجدول معين، مما يمنع تشارك المراجع بين الجداول المختلفة.
 */
export function createDefaultTableEntryState(): TableEntryState {
    return {
        search: '',
        viewMode: 'table',
        selectedRow: null,
        selectedRowIds: [],
        selectedRowsMap: {},
        data: [],
        isLoading: false,
        pagination: {
            pageIndex: 0,
            pageSize: 10,
        },
        sorting: [],
        serverPagination: null,
        lastUpdated: Date.now(),
    };
}

/** نسخة ثابتة تُستخدم فقط كقيمة fallback آمنة في المحددات (selectors) عند عدم وجود الجدول */
export const defaultTableEntryState: TableEntryState = Object.freeze(createDefaultTableEntryState());

/** الحالة الابتدائية لكامل الـ slice عند إقلاع التطبيق */
export const initialTableSliceState: TableSliceState = {
    tables: {},
};
