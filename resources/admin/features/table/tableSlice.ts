import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createDefaultTableEntryState, initialTableSliceState } from './tableSlice.initialState';
import type {
    HydrateFromServerPayload,
    RemoveRowPayload,
    RowId,
    SetRowStatePayload,
    TableEntryState,
    TableSliceState,
    TableSortingState,
    UpdateRowPayload,
    UpsertRowPayload,
} from './tableSlice.types';

/**
 * دالة مساعدة لجلب حالة الجدول أو إنشائها بحالة افتراضية مستقلة إن لم تكن موجودة.
 */
function getOrCreateTable(state: TableSliceState, tableId: string): TableEntryState {
    let existing = state.tables[tableId];

    if (!existing) {
        existing = createDefaultTableEntryState();
        state.tables[tableId] = existing;
    }

    return existing;
}

/**
 * دالة استخراج معرّف الصف (id أو slug)
 */
function getRowId(row: any): RowId | undefined {
    return row?.id ?? row?.slug;
}

export const tableSlice = createSlice({
    name: 'table',
    initialState: initialTableSliceState,
    reducers: {
        /**
         * تهيئة الجدول من استجابة السيرفر:
         * تُحدث البيانات، الترقيم، ومعلومات السيرفر، وتحدّث وقت آخر مزامنة.
         */
        hydrateFromServer: (state, action: PayloadAction<HydrateFromServerPayload>) => {
            const { tableId, data, pagination, serverPagination } = action.payload;
            const table = getOrCreateTable(state, tableId);

            table.data = Array.isArray(data) ? data : [];
            table.pagination = pagination;
            table.serverPagination = serverPagination;
            table.lastUpdated = Date.now();
        },

        /** تفعيل أو تعطيل مؤشر التحميل */
        setLoading: (state, action: PayloadAction<{ tableId: string; isLoading: boolean }>) => {
            const { tableId, isLoading } = action.payload;
            getOrCreateTable(state, tableId).isLoading = isLoading;
        },

        /** تحديث نص البحث */
        setSearch: (state, action: PayloadAction<{ tableId: string; search: string }>) => {
            const { tableId, search } = action.payload;
            getOrCreateTable(state, tableId).search = search;
        },

        /** تبديل نمط العرض (جدول، كروت، قائمة) */
        setViewMode: (state, action: PayloadAction<{ tableId: string; viewMode: string }>) => {
            const { tableId, viewMode } = action.payload;
            getOrCreateTable(state, tableId).viewMode = viewMode;
        },

        /** تحديد صف فردي (للمعاينة أو التعديل في حوار) */
        setSelectedRow: (state, action: PayloadAction<{ tableId: string; row: unknown | null }>) => {
            const { tableId, row } = action.payload;
            getOrCreateTable(state, tableId).selectedRow = row;
        },

        /** إلغاء تحديد الصف الفردي */
        clearSelectedRow: (state, action: PayloadAction<{ tableId: string }>) => {
            getOrCreateTable(state, action.payload.tableId).selectedRow = null;
        },

        /** استبدال كامل بيانات الجدول */
        setData: (state, action: PayloadAction<{ tableId: string; data: unknown[] }>) => {
            const { tableId, data } = action.payload;
            getOrCreateTable(state, tableId).data = Array.isArray(data) ? (data as any) : [];
        },

        /**
         * إضافة صف جديد في الجدول مباشرة مع حالة انتقالية اختيارية
         */
        addRow: (state, action: PayloadAction<UpsertRowPayload>) => {
            const { tableId, item, position = 'start', state: rowState } = action.payload;
            const table = getOrCreateTable(state, tableId);
            const rowToAdd = rowState ? { ...item, __row_state: rowState } : item;

            if (position === 'start') {
                table.data.unshift(rowToAdd);
            } else {
                table.data.push(rowToAdd);
            }
        },

        /**
         * تحديث بيانات صف موجود بالمعرّف مباشرة داخل الـ Store
         */
        updateRow: (state, action: PayloadAction<UpdateRowPayload>) => {
            const { tableId, id, changes, state: rowState } = action.payload;
            const table = getOrCreateTable(state, tableId);
            const index = table.data.findIndex((row) => getRowId(row) === id);

            if (index !== -1) {
                const current = table.data[index];
                table.data[index] = {
                    ...current,
                    ...changes,
                    ...(rowState !== undefined ? { __row_state: rowState } : {}),
                };
            }
        },

        /**
         * حذف صف بالمعرّف مباشرة من الجدول
         */
        removeRow: (state, action: PayloadAction<RemoveRowPayload>) => {
            const { tableId, id } = action.payload;
            const table = getOrCreateTable(state, tableId);
            table.data = table.data.filter((row) => getRowId(row) !== id);

            // إزالة المعرّف من قائمة التحديد الجماعي إن وُجد
            if (table.selectedRowsMap[id]) {
                delete table.selectedRowsMap[id];
                table.selectedRowIds = table.selectedRowIds.filter((item) => item !== id);
            }
        },

        /**
         * تعيين الحالة الانتقالية لصف محدد (created, updated, deleted, أو null لإزالة العلامة)
         */
        setRowState: (state, action: PayloadAction<SetRowStatePayload>) => {
            const { tableId, id, state: rowState } = action.payload;
            const table = getOrCreateTable(state, tableId);
            const index = table.data.findIndex((row) => getRowId(row) === id);

            if (index !== -1) {
                if (rowState === null) {
                    delete table.data[index].__row_state;
                } else {
                    table.data[index].__row_state = rowState;
                }
            }
        },

        /**
         * تبديل تحديد صف فردي للعمليات الجماعية
         */
        toggleSelectRow: (state, action: PayloadAction<{ tableId: string; id: RowId }>) => {
            const { tableId, id } = action.payload;
            const table = getOrCreateTable(state, tableId);

            if (table.selectedRowsMap[id]) {
                delete table.selectedRowsMap[id];
                table.selectedRowIds = table.selectedRowIds.filter((item) => item !== id);
            } else {
                table.selectedRowsMap[id] = true;
                table.selectedRowIds.push(id);
            }
        },

        /**
         * تحديد جميع الصفوف المعروضة حالياً
         */
        selectAllRows: (state, action: PayloadAction<{ tableId: string }>) => {
            const table = getOrCreateTable(state, action.payload.tableId);
            const ids: RowId[] = [];
            const map: Record<RowId, boolean> = {};

            table.data.forEach((row) => {
                const id = getRowId(row);
                if (id !== undefined) {
                    ids.push(id);
                    map[id] = true;
                }
            });

            table.selectedRowIds = ids;
            table.selectedRowsMap = map;
        },

        /**
         * إلغاء التحديد الجماعي لجميع الصفوف
         */
        clearRowSelection: (state, action: PayloadAction<{ tableId: string }>) => {
            const table = getOrCreateTable(state, action.payload.tableId);
            table.selectedRowIds = [];
            table.selectedRowsMap = {};
        },

        /** تحديث جزئي لإعدادات الترقيم */
        setPagination: (
            state,
            action: PayloadAction<{
                tableId: string;
                pagination: Partial<TableEntryState['pagination']>;
            }>,
        ) => {
            const { tableId, pagination } = action.payload;
            const table = getOrCreateTable(state, tableId);
            table.pagination = { ...table.pagination, ...pagination };
        },

        /** تحديث إعدادات الفرز */
        setSorting: (state, action: PayloadAction<{ tableId: string; sorting: TableSortingState }>) => {
            const { tableId, sorting } = action.payload;
            getOrCreateTable(state, tableId).sorting = sorting;
        },

        /** تصفير الفرز */
        clearSorting: (state, action: PayloadAction<{ tableId: string }>) => {
            getOrCreateTable(state, action.payload.tableId).sorting = [];
        },

        /** تحديث معلومات ترقيم السيرفر */
        setServerPagination: (
            state,
            action: PayloadAction<{ tableId: string; serverPagination: TableEntryState['serverPagination'] }>,
        ) => {
            const { tableId, serverPagination } = action.payload;
            getOrCreateTable(state, tableId).serverPagination = serverPagination;
        },

        /** تصفير حالة الجدول بالكامل */
        resetTable: (state, action: PayloadAction<{ tableId: string }>) => {
            state.tables[action.payload.tableId] = createDefaultTableEntryState();
        },

        /** حذف الجدول من الحالة */
        removeTable: (state, action: PayloadAction<{ tableId: string }>) => {
            delete state.tables[action.payload.tableId];
        },
    },
});

export const tableActions = tableSlice.actions;
export default tableSlice.reducer;
