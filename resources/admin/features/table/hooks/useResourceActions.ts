import { useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { confirmAlertDialog } from '@/components/custom/ConfirmDialog';
import { getAxiosErrorMessage } from '@/hooks/httpErrors';
import { useAppDispatch } from '@/store/hooks';
import { createTableRows } from '../utils/tableRows';
import { tMain } from '@/i18n';

type RowId = string | number;
type RouteFn = (...args: any[]) => any;

/**
 * الواجهة الأساسية لأي صف في الجدول.
 * تتطلب وجود معرّف فريد `id` مع مرونة لأي حقول إضافية.
 */
interface BaseRow {
    id: RowId;
    [key: string]: any;
}

/**
 * الخصائص المطلوبة لتهيئة هوك عمليات الصف `useResourceActions`.
 */
interface Props<T extends BaseRow> {
    /** المفتاح الفريد للجدول في Redux Store */
    tableId: string;
    /** مصفوفة بيانات الجدول الحالية */
    tableData: T[];
    /** الاسم المعرب للمورد (مثل: مدونة، فئة، مستخدم، منطقة) لعرضه في رسائل التأكيد والتوست */
    resourceName: string;
    /** دالة استخراج المعرّف الفريد للصف */
    getId: (row: T) => RowId;
    /** دالة استخراج الاسم المعروض للصف (لعرضه في رسائل الحذف والتأكيد) */
    getName: (row: T) => string;
    /** دالة توليد مسار الحذف عبر Wayfinder */
    destroyRoute: RouteFn;
    /** دالة توليد مسار التحديث الاختيارية عبر Wayfinder */
    updateRoute?: RouteFn;
    /** دالة استخراج كائن العنصر المحدث من استجابة السيرفر */
    extractUpdated?: (res: any) => T | null;
}

/**
 * هوك إدارة عمليات الصف القياسية (CRUD & State Transitions):
 *
 * يقوم بـ:
 * 1. توفير كائن `rows` لإضافة وتعديل وحذف الصفوف محلياً في Redux مع الرسوم المتحركة (`row-created`, `row-updated`, `row-deleted`).
 * 2. إدارة عملية الحذف الآمنة (`deleteRow`) عبر مربع حوار تأكيد (`confirmAlertDialog`) وتوست تفاعلي (`toast.promise`).
 * 3. الحفاظ على ثبات المراجع (`referential stability`) لمنع إعادة رسم المكونات دون داعٍ.
 */
export function useResourceActions<T extends BaseRow>({
    tableId,
    tableData,
    resourceName,
    getId,
    getName,
    destroyRoute,
}: Props<T>) {
    const dispatch = useAppDispatch();

    /**
     * الحفاظ على مرجع دائم لأحدث بيانات الجدول لاستخدامه داخل الـ Callbacks
     * دون التسبب في إعادة إنشاء الدوال مع كل تغيير.
     */
    const tableDataRef = useCallback(() => tableData, [tableData]);

    /**
     * إنشاء كائن التلاعب بصفوف Redux:
     * - `rows.add(item)`: إضافة صف جديد في أعلى الجدول مع أنيميشن الإضافة.
     * - `rows.update(item)`: تحديث بيانات صف موجود مع أنيميشن التحديث.
     * - `rows.remove(id)`: حذف صف من الجدول بعد انقضاء أنيميشن الحذف.
     */
    const rows = useMemo(
        () => createTableRows<T>(dispatch, tableId, tableDataRef()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dispatch, tableId, tableData],
    );

    /**
     * دالة الحذف الموحدة:
     * - تطلب تأكيد المستخدم أولاً.
     * - عند الموافقة ترسل طلب الحذف للسيرفر مع عرض مؤشر تحميل عبر `toast.promise`.
     * - عند النجاح تحذف الصف من جدول Redux تلقائياً وتظهر رسالة نجاح مخصصة.
     */
    const deleteRow = useCallback(
        async (row: T) => {
            const ok = await confirmAlertDialog({
                title: tMain('confirm_delete', {
                    name: getName(row),
                    resource: resourceName,
                }),
            });

            if (!ok) return;

            toast.promise(
                async () => {
                    const route = destroyRoute(getId(row));
                    await axios.request({
                        url: route.url,
                        method: route.method,
                    });
                },
                {
                    success: () => {
                        rows.remove(getId(row));
                        return tMain('deleted', {
                            name: getName(row),
                            resource: resourceName,
                        });
                    },
                    error: (err) =>
                        getAxiosErrorMessage(err, {
                            fallback: tMain('delete_failed', {
                                name: getName(row),
                                resource: resourceName,
                            }),
                        }),
                },
            );
        },
        [rows, getName, resourceName, destroyRoute, getId],
    );

    return {
        /** دالة إضافة صف جديد للجدول */
        addRow: rows.add,
        /** دالة تحديث بيانات صف موجود في الجدول */
        updateRow: rows.update,
        /** دالة حذف الصف مع مربع تأكيد ورسائل توست */
        deleteRow,
        /** كائن التلاعب المباشر بالصفوف في Redux */
        rows,
    };
}
