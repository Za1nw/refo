import {
    selectTableData,
    selectTablePagination,
    selectTableSearch,
    selectTableSelectedCount,
    selectTableSelectedRowIds,
    selectTableServerPagination,
    selectTableSorting,
    selectTableViewMode,
    tableActions,
} from '@/features/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RowData, SortingState, Updater } from '@tanstack/react-table';
import { type LegacyColumnDef as ColumnDef, getCoreRowModel, useLegacyTable } from '@tanstack/react-table/legacy';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RowId } from '../tableSlice.types';

/**
 * نوع مرن يمثل أزرار وإجراءات الصفوف في الجدول (تعديل، حذف، حظر، تغيير حالة، ترجمة، عرض... إلخ).
 * يتيح لكل هوك مورد تخصيص الإجراءات المتاحة له بحرية تامة دون قيود على الأسماء.
 */
export type ButtonsActions = {
    /** دالة فتح فورم التعديل */
    onEdit?: (item: any) => void;
    /** دالة حذف الصف */
    onDelete?: (item: any) => void;
    /** دالة فتح حوار الترجمة */
    onTranslate?: (item: any) => void;
    /** دالة عرض التفاصيل */
    onView?: (item: any) => void;
    /**
     * أي إجراء إضافي آخر (مثل toggleStatus, onBlockUser, onChangeOrderStatus...)
     * أو كائنات متداخلة لإدارة الصفوف محلياً (مثل rows: { add, update, remove }).
     */
    [key: string]: any;
};

/**
 * العمليات الأساسية المتاحة لكل صف داخل الجدول (الإضافة والتعديل عبر الفورم).
 */
export type RowActions<T> = ButtonsActions & {
    /** دالة إضافة صف جديد إلى الجدول محلياً في Redux */
    addRow: (...args: any[]) => any;
    /** دالة تحديث صف موجود في الجدول محلياً في Redux */
    updateRow: (...args: any[]) => any;
};

/**
 * واجهة مزامنة السيرفر الأساسية (ServerSync).
 * تدير الفرز، البحث، التنقل بين الصفحات، وتغيير حجم الصفحة.
 */
export interface ServerSync extends Record<string, any> {
    /** معالج تغيير اتجاه أو عمود الفرز على مستوى السيرفر */
    onSortingChange: (updater: Updater<SortingState>, perPage: number) => void;
    /** معالج البحث النصي وإرساله للسيرفر مع عدد العناصر */
    searchData: (text: string, perPage: number) => void;
    /** معالج الانتقال إلى رابط صفحة معينة */
    changePage: (url: string | null) => void;
    /** معالج تغيير عدد العناصر المعروضة في الصفحة الواحدة */
    changePageSize: (size: number, path: string) => void;
    /** مزامنة الفلاتر وحالات البحث من معلمات رابط الصفحة (URL Search Params) */
    syncStatusFromUrl?: () => void;
}

/**
 * الخصائص المطلوبة لتهيئة هوك الجداول العام `useTableResources`.
 *
 * @template T - نوع عنصر الصف (مثل Blog, Merchant, Category, ...)
 * @template TActions - نوع الإجراءات المرجعة من هوك العمليات الخاص بالمورد
 * @template TServerSync - نوع كائن مزامنة السيرفر بما يحتويه من فلاتر إضافية
 */
interface UseTableResourcesProps<T extends RowData, TActions extends RowActions<T>, TServerSync extends ServerSync> {
    /** كائن التصفح والبيانات القادم من السيرفر (Inertia Props Pagination) */
    resources: Pagination<T>;
    /** المفتاح الفريد للجدول في Redux Store */
    tableId: string;
    /** هوك العمليات المخصص لهذا المورد (إضافة، تعديل، حذف، تغيير حالة) */
    useActions: (args: { tableId: string; tableData: T[] }) => TActions;
    /**
     * هوك تعريف أعمدة TanStack Table.
     * يستقبل كائن الإجراءات ودالة `editRow` لربط أزرار الإجراءات بالخلايا.
     */
    useColumns: (actions: ButtonsActions & { editRow: (row: T) => void }) => ColumnDef<T, any>[];
    /** هوك مزامنة السيرفر المسؤول عن طلبات البحث، الفرز، والفلترة */
    useServerSync: (args: { tableId: string; search: string; sorting: SortingState; pageSize: number }) => TServerSync;
    /**
     * تحديد ما إذا كان الجدول يدعم إضافة عناصر جديدة ويحتوي على زر إضافة.
     * عند ضبطه على `false`، سيتم إلغاء تفعيل `onCreate` وإخفاء زر الإضافة من التولبار تلقائياً.
     * @default true
     */
    hasCreate?: boolean;
}

/**
 * الهوك المركزي والشامل لإدارة أي جدول مرتبط بمورد سيرفر في النظام.
 *
 * يدمج وينسق بشكل تلقائي بين:
 * 1. حالة الجدول في Redux Store (البيانات، التصفح، الفرز، البحث، التحديد الجماعي).
 * 2. مكتبة TanStack Table بالوضع اليدوي التام (`manualPagination: true`, `manualSorting: true`).
 * 3. هوك العمليات (`useActions`) لإدارة التعديل، الحذف، والرسائل التفاعلية.
 * 4. هوك الأعمدة (`useColumns`) لتعريف شكل الخلايا والأزرار.
 * 5. هوك مزامنة السيرفر (`useServerSync`) للتواصل مع الباك-إند والـ Partial Reloads.
 * 6. إدارة حالة الفورم والـ Drawers (الفتح، الإغلاق، وتمرير العنصر المحدد `formItem`).
 * 7. التحكم التام في إظهار أو إخفاء زر الإضافة (`hasCreate`).
 */
export function useTableResources<
    T extends RowData,
    TActions extends RowActions<T> = RowActions<T>,
    TServerSync extends ServerSync = ServerSync
>({
    resources,
    tableId,
    useActions,
    useColumns,
    useServerSync,
    hasCreate = true,
}: UseTableResourcesProps<T, TActions, TServerSync>) {
    const dispatch = useAppDispatch();

    // قراءة حالة الجدول المخزنة حالياً في Redux
    const search = useAppSelector((state) => selectTableSearch(state, tableId));
    const tableData = useAppSelector((state) => selectTableData(state, tableId) as T[]);
    const pagination = useAppSelector((state) => selectTablePagination(state, tableId));
    const serverPagination = useAppSelector((state) => selectTableServerPagination(state, tableId));
    const sorting = useAppSelector((state) => selectTableSorting(state, tableId));
    const viewMode = useAppSelector((state) => selectTableViewMode(state, tableId));
    const selectedRowIds = useAppSelector((state) => selectTableSelectedRowIds(state, tableId));
    const selectedCount = useAppSelector((state) => selectTableSelectedCount(state, tableId));

    // حالات العرض المحلية للفورم والصفحات
    const [isClient] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formItem, setFormItem] = useState<T | null>(null);

    // استخراج ومعالجة بيانات الاستجابة الواردة من السيرفر
    const raw = (resources || {}) as any;
    const rawData = resources?.data;
    const rawMeta = resources?.meta;
    const rawLinks = resources?.links;

    const currentPage = rawMeta?.current_page ?? raw.current_page ?? 1;
    const perPage = rawMeta?.per_page ?? raw.per_page ?? 10;
    const total = rawMeta?.total ?? raw.total ?? (rawData?.length ?? 0);
    const lastPage = rawMeta?.last_page ?? raw.last_page ?? 1;
    const from = rawMeta?.from ?? raw.from ?? 1;
    const to = rawMeta?.to ?? raw.to ?? (rawData?.length ?? 0);
    const path = rawMeta?.path ?? raw.path ?? '';

    // بناء كائن Meta موحد للتصفح
    const meta = useMemo(() => rawMeta ?? {
        current_page: currentPage,
        from,
        last_page: lastPage,
        links: Array.isArray(raw.links) ? raw.links : [],
        path,
        per_page: perPage,
        to,
        total,
    }, [currentPage, from, lastPage, path, perPage, raw.links, rawMeta, to, total]);

    // بناء كائن روابط التصفح السريعة
    const links = useMemo(() => rawLinks ?? {
        first: raw.first_page_url ?? null,
        last: raw.last_page_url ?? null,
        prev: raw.prev_page_url ?? null,
        next: raw.next_page_url ?? null,
    }, [raw.first_page_url, raw.last_page_url, raw.next_page_url, raw.prev_page_url, rawLinks]);

    // مزامنة وتهيئة بيانات Redux عند استقبال بيانات جديدة من السيرفر (Inertia Partial Reloads)
    useEffect(() => {
        const nextData = Array.isArray(rawData) ? [...rawData] : [];

        dispatch(
            tableActions.hydrateFromServer({
                tableId,
                data: nextData,
                serverPagination: {
                    links: { ...links },
                    meta: { ...meta, links: Array.isArray(meta?.links) ? [...meta.links] : [] },
                },
                pagination: {
                    pageIndex: (currentPage ?? 1) - 1,
                    pageSize: perPage ?? 10,
                },
            }),
        );
    }, [tableId, rawData, currentPage, perPage, total, lastPage, from, to, path, dispatch]);

    // استدعاء هوك العمليات الخاص بالمورد
    const { addRow, updateRow, ...buttonActions } = useActions({ tableId, tableData });

    /**
     * دالة فتح فورم إنشاء عنصر جديد
     */
    const onCreate = hasCreate
        ? () => {
              if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
              }
              setFormItem(null);
              setIsFormOpen(true);
          }
        : undefined;

    /**
     * دالة فتح فورم تعديل صف موجود
     */
    const editRow = useCallback((row: T) => {
        setFormItem(row);
        setIsFormOpen(true);
    }, []);

    /**
     * دالة إغلاق الفورم وتصفير حالة الصف المحدد
     */
    const closeForm = useCallback(() => {
        setIsFormOpen(false);
        setFormItem(null);
    }, []);

    // دوال التحديد الجماعي للصفوف
    const toggleSelectRow = useCallback(
        (id: RowId) => dispatch(tableActions.toggleSelectRow({ tableId, id })),
        [dispatch, tableId],
    );

    const selectAllRows = useCallback(
        () => dispatch(tableActions.selectAllRows({ tableId })),
        [dispatch, tableId],
    );

    const clearRowSelection = useCallback(
        () => dispatch(tableActions.clearRowSelection({ tableId })),
        [dispatch, tableId],
    );

    const setViewMode = useCallback(
        (mode: string) => dispatch(tableActions.setViewMode({ tableId, viewMode: mode })),
        [dispatch, tableId],
    );

    // توليد تعريف أعمدة الجدول مع ربط دالة التعديل وكافة الإجراءات المتاحة
    const columns = useColumns({ editRow, ...buttonActions });

    // استدعاء هوك مزامنة السيرفر وتمرير معلمات البحث والفرز والصفحات
    const serverSync = useServerSync({ tableId, search, sorting, pageSize: pagination.pageSize });
    const {
        onSortingChange: serverOnSortingChange,
        searchData: serverSearchData,
        changePage,
        changePageSize,
        syncStatusFromUrl,
        ...restServerSync
    } = serverSync;

    // قراءة وتطبيق الفلاتر المحفوظة في معلمات الرابط عند التحميل الأولي
    useEffect(() => {
        syncStatusFromUrl?.();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // بناء وتهيئة كائن TanStack React Table
    const table = useLegacyTable({
        data: tableData,
        columns,
        pageCount: serverPagination?.meta?.last_page ?? -1,
        state: { pagination, sorting },
        onSortingChange: (updater) => serverOnSortingChange(updater, perPage),
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        meta: {
            pagination: serverPagination ?? { links, meta },
            onChangePage: changePage,
            onChangePageSize: changePageSize,
            getRowClassName: (original: any) => {
                if (!original) return '';
                const state = (original as any).__row_state as string | undefined;
                if (state === 'created') return 'row-created';
                if (state === 'updated') return 'row-updated';
                if (state === 'deleted') return 'row-deleted';
                return '';
            },
        },
    });

    /**
     * دالة البحث النصي مع ربطها بحجم الصفحة الحالي.
     */
    const searchData = useCallback((text: string) => serverSearchData(text, perPage), [perPage, serverSearchData]);

    return {
        /** كائن جدول TanStack Table الرئيسي */
        table,
        /** معرّف الجدول في Redux */
        tableId,
        /** أعمدة الجدول المعرّفة */
        columns,
        /** إشارة جاهزية العميل */
        isClient,
        /** هل يدعم الجدول ميزة الإضافة؟ */
        hasCreate,
        /** دالة فتح فورم الإنشاء (تكون undefined إذا كان hasCreate = false) */
        onCreate,
        /** هل فورم الإضافة/التعديل مفتوح حالياً؟ */
        isFormOpen,
        /** كائن الصف الجاري تعديله (أو null عند الإضافة) */
        formItem,
        /** دالة إغلاق الفورم */
        closeForm,
        /** دالة إضافة صف محلياً لـ Redux */
        addRow,
        /** دالة تحديث صف محلياً في Redux */
        updateRow,
        /** القيمة النصية الحالية للبحث */
        search,
        /** نمط العرض الحالي (table / cards / list) */
        viewMode,
        /** دالة تغيير نمط العرض */
        setViewMode,
        /** مصفوفة معرّفات الصفوف المحددة جماعياً */
        selectedRowIds,
        /** عدد الصفوف المحددة */
        selectedCount,
        /** دالة تبديل تحديد صف فردي */
        toggleSelectRow,
        /** دالة تحديد كافة الصفوف */
        selectAllRows,
        /** دالة تصفير التحديد الجماعي */
        clearRowSelection,
        /** دالة تنفيذ البحث في السيرفر */
        searchData,
        /** دالة الانتقال لصفحة معينة */
        changePage,
        /** دالة تغيير عدد العناصر في الصفحة */
        changePageSize,
        /** دالة فتح فورم تعديل صف معين */
        editRow,
        // تضمين جميع إجراءات الأزرار الإضافية (deleteRow, toggleStatus, onBlockUser...)
        ...buttonActions,
        // تضمين جميع الفلاتر وقيمها من useServerSync (مثل statusFilter, categoryFilter, ...)
        ...restServerSync,
    };
}
