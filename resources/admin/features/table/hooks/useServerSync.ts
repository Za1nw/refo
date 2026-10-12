import { tableActions } from '@/features/table';
import { useAppDispatch } from '@/store/hooks';
import type { RequestPayload } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import type { SortingState, Updater } from '@tanstack/react-table';
import { useCallback, useState } from 'react';

/**
 * إعدادات تعريف فلتر مخصص للجدول.
 *
 * @template TKey - اسم مفتاح الفلتر داخل الحالة (مثل 'status' أو 'category_id')
 */
export interface FilterConfig<TKey extends string> {
    /** المفتاح البرمجي للفلتر داخل الحالة */
    key: TKey;
    /** اسم المعامل الذي سيُرسل في الـ Query String إلى السيرفر */
    param: string;
    /** القيمة التي تعتبر فارغة أو غير محددة (مثل 'all' أو '') ولن يتم إرسالها لتخفيف الطلب */
    emptyValue: string;
    /** مصفوفة القيم المسموح قراءتها من الرابط لمنع تمرير قيم غير صالحة */
    allowedValues?: readonly string[];
    /** القيمة الافتراضية للفلتر عند عدم توفر قيمة سابقة */
    default?: string;
    /** دالة مخصصة للتحقق مما إذا كانت القيمة غير صالحة */
    inValidValue?: (value: string) => boolean;
}

type FiltersState<TKey extends string> = Record<TKey, string>;

/**
 * هوك مزامنة السيرفر الشامل (`useServerSync`):
 *
 * يدير جميع عمليات التواصل والتحديث الجزئي (`Partial Reload`) مع الباك-إند عبر Inertia:
 * 1. البحث النصي (`searchData`): إرسال نص البحث مع إعادة ضبط الصفحة على 1.
 * 2. الفرز (`onSortingChange`): إرسال عمود الفرز واتجاهه (`sort_by`, `sort_order`).
 * 3. التصفح (`changePage`): الانتقال إلى روابط الصفحات (`prev`, `next`, أو رقم الصفحة).
 * 4. حجم الصفحة (`changePageSize`): تغيير عدد العناصر في الصفحة الواحدة.
 * 5. الفلاتر المخصصة (`setFilter` / `setFilters`): تطبيق الفلاتر وإرسالها مع الطلب.
 * 6. مزامنة معلمات الرابط (`syncFiltersFromUrl`): قراءة الفلاتر والبحث من عنوان الصفحة لدعم مشاركة الروابط.
 * 7. التحكم في مؤشر التحميل التلقائي (`tableActions.setLoading`).
 */
export function useServerSync<TFilterKey extends string = never>({
    tableId,
    search,
    sorting,
    pageSize,
    getIndexUrl,
    only,
    filters: filterConfigs = [] as FilterConfig<TFilterKey>[],
}: {
    /** معرّف الجدول في Redux */
    tableId: string;
    /** نص البحث الحالي */
    search: string;
    /** حالة الفرز الحالية */
    sorting: SortingState;
    /** حجم الصفحة الحالي */
    pageSize: number;
    /** دالة إرجاع رابط الـ Index الأساسي عبر Wayfinder */
    getIndexUrl: () => string;
    /** مصفوفة أسماء الـ Props المطلوب تحديثها فقط في استجابة Inertia (Partial Reload) */
    only: string[];
    /** مصفوفة إعدادات الفلاتر الخاصة بهذا المورد */
    filters?: FilterConfig<TFilterKey>[];
}) {
    const dispatch = useAppDispatch();

    /**
     * حالة الفلاتر الحالية (مفتاح: قيمة)
     */
    const [filterValues, setFilterValues] = useState<FiltersState<TFilterKey>>(() => {
        const initial = {} as FiltersState<TFilterKey>;
        filterConfigs.forEach((f) => {
            initial[f.key] = f.default ?? f.emptyValue;
        });
        return initial;
    });

    /**
     * بناء معاملات الفلاتر التي سيتم تضمينها في الطلب (استبعاد القيم الفارغة `emptyValue`).
     */
    const buildFilterParams = useCallback(
        (values: FiltersState<TFilterKey>): Record<string, string> => {
            const result: Record<string, string> = {};
            filterConfigs.forEach((f) => {
                const value = values[f.key];
                if (value !== f.emptyValue) {
                    result[f.param] = value;
                }
            });
            return result;
        },
        [filterConfigs],
    );

    const getServerFilterParams = useCallback(() => buildFilterParams(filterValues), [buildFilterParams, filterValues]);

    /**
     * قراءة قيم البحث والفلاتر من معلمات الرابط (URL Search Params) عند التحميل الأولي.
     */
    const syncFiltersFromUrl = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        dispatch(tableActions.setSearch({ tableId, search: params.get('search') ?? '' }));

        setFilterValues((prev) => {
            const next = { ...prev };
            filterConfigs.forEach((f) => {
                const raw = params.get(f.param);
                next[f.key] = raw && (f.allowedValues ? f.allowedValues.includes(raw) : !f.inValidValue || !f.inValidValue(raw)) ? raw : f.emptyValue;
            });
            return next;
        });
    }, [dispatch, filterConfigs, tableId]);

    /**
     * بناء معاملات الفرز (`sort_by` و `sort_order`) من حالة TanStack Table.
     */
    const getServerSortParams = useCallback((): { sort_by?: string; sort_order?: 'asc' | 'desc' } => {
        const first = sorting?.[0];
        if (!first?.id) {
            return {};
        }

        return {
            sort_by: first.id,
            sort_order: first.desc ? 'desc' : 'asc',
        };
    }, [sorting]);

    /**
     * دالة الجلب الموحدة عبر `router.get` في Inertia:
     * - تحافظ على حالة الصفحة وموضع التمرير (`preserveState`, `preserveScroll`).
     * - تطلب فقط الـ prop المحدد عبر `only` لضمان أقصى سرعة واستجابة.
     * - تدير حالة مؤشر التحميل في Redux.
     */
    const fetchData = useCallback(
        (url: string, params?: RequestPayload) => {
            return router.get(url, params, {
                preserveState: true,
                preserveScroll: true,
                only,
                replace: true,
                onStart: () => dispatch(tableActions.setLoading({ tableId, isLoading: true })),
                onFinish: () => dispatch(tableActions.setLoading({ tableId, isLoading: false })),
            });
        },
        [dispatch, only, tableId],
    );

    /**
     * تعيين قيمة فلتر فردي وإرسال الطلب للسيرفر مع إعادة الصفحة للبداية.
     */
    const setFilter = useCallback(
        (key: TFilterKey, value: string) => {
            const nextValues = { ...filterValues, [key]: value };
            setFilterValues(nextValues);
            dispatch(tableActions.setPagination({ tableId, pagination: { pageIndex: 0 } }));

            fetchData(getIndexUrl(), {
                search,
                per_page: pageSize,
                ...getServerSortParams(),
                ...buildFilterParams(nextValues),
            });
        },
        [buildFilterParams, dispatch, fetchData, filterValues, getIndexUrl, getServerSortParams, pageSize, search, tableId],
    );

    /**
     * تعيين قيم متعددة للفلاتر معاً في طلب واحد.
     */
    const setFilters = useCallback(
        (updates: Partial<Record<TFilterKey, string>>) => {
            const nextValues = { ...filterValues, ...updates };
            setFilterValues(nextValues);
            dispatch(tableActions.setPagination({ tableId, pagination: { pageIndex: 0 } }));

            fetchData(getIndexUrl(), {
                search,
                per_page: pageSize,
                ...getServerSortParams(),
                ...buildFilterParams(nextValues),
            });
        },
        [buildFilterParams, dispatch, fetchData, filterValues, getIndexUrl, getServerSortParams, pageSize, search, tableId],
    );

    /**
     * معالج تغيير ترتيب الأعمدة من TanStack Table.
     */
    const onSortingChange = useCallback(
        (updater: Updater<SortingState>, perPage: number) => {
            const next = typeof updater === 'function' ? updater(sorting) : updater;
            dispatch(tableActions.setSorting({ tableId, sorting: next }));

            const first = next?.[0];
            fetchData(getIndexUrl(), {
                search,
                per_page: perPage,
                ...(first?.id ? { sort_by: first.id, sort_order: first.desc ? 'desc' : 'asc' } : {}),
                ...getServerFilterParams(),
            });

            return next;
        },
        [dispatch, fetchData, getIndexUrl, getServerFilterParams, search, sorting, tableId],
    );

    /**
     * معالج البحث النصي من التولبار.
     */
    const searchData = useCallback(
        (text: string, perPage: number) => {
            dispatch(tableActions.setSearch({ tableId, search: text }));
            fetchData(getIndexUrl(), {
                search: text,
                per_page: perPage,
                ...getServerSortParams(),
                ...getServerFilterParams(),
            });
        },
        [dispatch, fetchData, getIndexUrl, getServerFilterParams, getServerSortParams, tableId],
    );

    /**
     * معالج التنقل بين الصفحات عبر روابط السيرفر.
     */
    const changePage = useCallback(
        (url: string | null) => {
            if (!url) {
                return;
            }

            fetchData(url, { ...getServerSortParams(), ...getServerFilterParams() });
        },
        [fetchData, getServerFilterParams, getServerSortParams],
    );

    /**
     * معالج تغيير عدد السجلات في الصفحة الواحدة.
     */
    const changePageSize = useCallback(
        (size: number, path: string) => {
            dispatch(tableActions.setPagination({ tableId, pagination: { pageIndex: 0, pageSize: size } }));
            fetchData(path, {
                search,
                per_page: size,
                ...getServerSortParams(),
                ...getServerFilterParams(),
            });
        },
        [dispatch, fetchData, getServerFilterParams, getServerSortParams, search, tableId],
    );

    return {
        /** كائن قيم الفلاتر الحالية */
        filterValues,
        /** دالة قراءة الفلاتر من الرابط */
        syncFiltersFromUrl,
        /** دالة تعيين فلتر واحد */
        setFilter,
        /** دالة تعيين فلاتر متعددة */
        setFilters,
        /** دالة تغيير الفرز */
        onSortingChange,
        /** دالة البحث */
        searchData,
        /** دالة تغيير الصفحة */
        changePage,
        /** دالة تغيير حجم الصفحة */
        changePageSize,
    };
}
