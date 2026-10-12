import type { JSX } from "react";

import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";

/**
 * توقيع دالة "هيكل تحميل" مخصّصة (Custom Skeleton Renderer)، يمكن تمريرها
 * من initHook.rowSkeleton لاستبدال الهيكل الافتراضي بشكل مختلف لجدول معيّن.
 * `visibleColumns` تحتوي فهارس الأعمدة المرئية حاليًا (بعد إخفاء أعمدة عبر
 * إعدادات تخصيص الجدول).
 */
export type RowSkeletonRenderer = (
    visibleColumns: number[],
    columnCount: number,
    pageSize: number,
) => JSX.Element[];

/**
 * الهيكل الافتراضي المعروض أثناء تحميل بيانات الجدول (isLoading = true).
 * يعرض عدد صفوف يساوي `pageSize` الحالي، وكل صف يحتوي عددًا من الخلايا
 * يساوي `columnCount` (الأعمدة المرئية + عمود التفاصيل إن وُجد).
 *
 * `visibleColumns` غير مستخدمة فعليًا هنا لأن الهيكل الافتراضي عام
 * (مجرد مستطيلات رمادية)، لكنها متوفرة لمن يكتب renderer مخصص يحتاج
 * معرفة الأعمدة المرئية فعليًا (مثلاً لعرض هيكل مختلف لعمود الصورة).
 */
export default function RowSkeleton(
    _visibleColumns: number[],
    columnCount: number,
    pageSize: number,
): JSX.Element[] {
    return Array.from({ length: pageSize }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} className="animate-pulse">
            {Array.from({ length: columnCount }).map((_, cellIndex) => (
                <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
                    <Skeleton className="h-4 w-full" />
                </TableCell>
            ))}
        </TableRow>
    ));
}
