import { PlusIcon } from "lucide-react";
import { FC, memo, MouseEventHandler, useMemo, useRef } from "react";

import { Table } from "@/components/ui/table";
import { TableProvider, useOptionalTableContext, useTableContext } from "@/context/TableContext";
import { useVisibleColumns } from "@/hooks/use-visible-columns";
import { TableCustomizeProps } from "@/types/table";

/**
 * يغلّف عنصر `<Table />` من tanstack/react-table، ويوفّر للأبناء فهارس
 * الأعمدة المرئية حاليًا (visibleColumns) عبر context، بحيث يمكن للجدول
 * الأب إخفاء/إظهار أعمدة حسب المساحة المتوفرة (Responsive columns).
 *
 * الاستخدام يكون عبر render-prop: الأبناء يمكن أن تكون دالة تستقبل
 * visibleColumns مباشرة، أو عنصر React عادي.
 */
const TableCustomize: FC<TableCustomizeProps> = ({ children, columns = [], className = "" }) => {
    const tableRef = useRef<HTMLDivElement>(null);
    const parentContext = useOptionalTableContext();

    const visibleColumns = useVisibleColumns(tableRef, columns);

    // ندمج context الأب (إن وُجد) مع visibleColumns الجديدة، بدل استبداله
    // بالكامل، حفاظًا على أي قيم أخرى (مثل handleRowClick) قد يوفّرها أصلاً
    const providerValue = useMemo(
        () => ({ ...(parentContext ?? {}), visibleColumns }),
        [parentContext, visibleColumns],
    );

    const containerClassName = `scrollbar scrollbar-thumb-width-1.5 not-hover:*:overflow-hidden! hover:*:overflow-x-visible! ${className}`;

    return (
        <TableProvider value={providerValue}>
            <div ref={tableRef} className={containerClassName}>
                <Table className={className}>
                    {typeof children === "function" ? children(visibleColumns) : children}
                </Table>
            </div>
        </TableProvider>
    );
};

interface TableButtonProps {
    onClick?: MouseEventHandler<HTMLDivElement>;
    hidden?: string;
}

/**
 * زر صغير (دائرة بعلامة +) في بداية كل صف، يُستخدم لفتح نافذة تفاصيل
 * الصف. عند عدم تمرير onClick، يستخدم handleRowClick من TableContext
 * كسلوك افتراضي، بحيث يبقى السلوك موحّدًا بين كل الجداول التي لا تحتاج
 * تخصيص هذا الزر.
 */
const TableButtonBase: FC<TableButtonProps> = ({ onClick, hidden, ...props }) => {
    const { handleRowClick } = useTableContext();

    return (
        <td className={"border p-1 w-5 " + (hidden || "")} {...props}>
            <div
                className="rounded-full cursor-pointer w-5 h-5 shadow-[0_0px_3px_rgba(0,0,0,0.3)] shadow-primary flex justify-center items-center"
                onClick={onClick || handleRowClick}
            >
                <PlusIcon size={15} className="rounded-full bg-primary text-muted" />
            </div>
        </td>
    );
};

const TableButton = memo(TableButtonBase);

export { TableCustomize, TableButton };
