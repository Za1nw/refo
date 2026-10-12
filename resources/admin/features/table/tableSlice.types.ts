/**
 * ===========================================================================
 * أنواع (Types) خاصة بـ Table Feature Slice
 * ===========================================================================
 * يوفر هذا الملف كافة التعريفات والواجهات البرمجية لحالة الجداول في Redux Store،
 * بما يشمل التصفح المحلي والسيرفر، الفرز، البحث، تحديد الصفوف الفردي والجماعي،
 * والحالات الانتقالية للصفوف (Created, Updated, Deleted).
 */

/** نوع معرّف الصف (رقمي أو نصي) */
export type RowId = string | number;

/** حالة الفرز لعمود معيّن */
export interface ColumnSortState {
    id: string;
    desc: boolean;
}

/** مصفوفة الفرز المتوافقة مع TanStack Table */
export type TableSortingState = ColumnSortState[];

/** شكل بيانات الترقيم (Pagination) المحلي المستخدم داخل TanStack Table */
export interface TablePaginationState {
    pageIndex: number;
    pageSize: number;
}

/** رابط واحد من روابط الترقيم القادمة من السيرفر (Laravel Pagination Link) */
export interface ServerPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/** روابط التصفح الأساسية (أول/آخر/سابق/تالي) القادمة من السيرفر */
export interface ServerPaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

/** معلومات الترقيم التفصيلية (meta) القادمة من السيرفر */
export interface ServerPaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: ServerPaginationLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

/** بيانات الترقيم الكاملة كما تُرجعها واجهة Laravel/Inertia */
export interface ServerPagination {
    links: ServerPaginationLinks;
    meta: ServerPaginationMeta;
}

/** حالات الصف الانتقالية للأنيميشن والتفاعل التفاؤلي */
export type RowTransitionState = 'created' | 'updated' | 'deleted' | null;

/** صف يحمل علامة حالة انتقالية اختيارية */
export type RowWithTransition<T = Record<string, any>> = T & {
    __row_state?: RowTransitionState;
};

/** الحالة الكاملة لجدول واحد (يُعرَّف لكل tableId على حدة) */
export interface TableEntryState<TRow = any> {
    /** نص البحث الحالي */
    search: string;
    /** نمط العرض الحالي ('table' | 'cards' | 'list' | ...) */
    viewMode: string;
    /** الصف المحدد حالياً لفتح حوار العرض أو التعديل */
    selectedRow: TRow | null;
    /** مصفوفة المعرفات المحددة للعمليات الجماعية (Bulk Actions) */
    selectedRowIds: RowId[];
    /** خريطة لتحديد سريع إذا كان المعرّف محدداً (O(1) lookup) */
    selectedRowsMap: Record<RowId, boolean>;
    /** مصفوفة بيانات الصفوف الحالية */
    data: RowWithTransition<TRow>[];
    /** مؤشر حالة التحميل للجدول */
    isLoading: boolean;
    /** إعدادات الترقيم المحلي */
    pagination: TablePaginationState;
    /** إعدادات الفرز الحالي */
    sorting: TableSortingState;
    /** معلومات ترقيم السيرفر */
    serverPagination: ServerPagination | null;
    /** وقت آخر تحديث للجدول (Timestamp) */
    lastUpdated?: number;
}

/** حالة الـ slice ككل: قاموس من الجداول، كل جدول مُعرَّف بمعرّفه (tableId) */
export interface TableSliceState {
    tables: Record<string, TableEntryState | undefined>;
}

/** الشكل المتوقع للـ Root State في Redux */
export interface TableRootState {
    table: TableSliceState;
    [key: string]: any;
}

/** الحمولات البرمجية للـ Actions */
export interface HydrateFromServerPayload<T = any> {
    tableId: string;
    data: T[];
    pagination: TablePaginationState;
    serverPagination: ServerPagination | null;
}

export interface SetRowStatePayload {
    tableId: string;
    id: RowId;
    state: RowTransitionState;
}

export interface UpsertRowPayload<T = any> {
    tableId: string;
    item: T;
    position?: 'start' | 'end';
    state?: RowTransitionState;
}

export interface UpdateRowPayload<T = any> {
    tableId: string;
    id: RowId;
    changes: Partial<T> | T;
    state?: RowTransitionState;
}

export interface RemoveRowPayload {
    tableId: string;
    id: RowId;
}
