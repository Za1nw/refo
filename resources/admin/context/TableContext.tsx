import { createContext, useContext, ReactNode, FC } from "react";
import type { ButtonsActions } from "@/types/table";

/**
 * واجهة سياق الجدول العام (`TableContextType`).
 * توفر معلومات الجدول والعمليات لأي مكون فرعي (مثل الأزرار، الكروت، أو القوائم المنسدلة).
 */
export interface TableContextType {
    /** معرّف الجدول الفريد في Redux */
    tableId?: string;
    /** مصفوفة أرقام الأعمدة المرئية */
    visibleColumns?: number[];
    /** دالة النقر على الصف */
    handleRowClick?: () => void;
    /** كائن أزرار وإجراءات الصفوف */
    actions?: ButtonsActions;
    /** دالة فتح فورم إنشاء عنصر جديد */
    onCreate?: () => void;
    /** هل يدعم الجدول ميزة الإضافة؟ */
    hasCreate?: boolean;
    /** هل يجب إظهار زر الإضافة في واجهة الجدول؟ */
    showCreate?: boolean;
    [key: string]: unknown;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

interface TableProviderProps {
    children: ReactNode;
    value: TableContextType;
}

/**
 * مزود سياق الجدول (`TableProvider`).
 * يغلف عناصر الجدول ويمرر لها معلومات الجدول والإجراءات المشتركة.
 */
export const TableProvider: FC<TableProviderProps> = ({ children, value }) => {
    return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};

/**
 * هوك اختياري للوصول لسياق الجدول دون إلقاء استثناء عند عدم التوفر.
 */
export const useOptionalTableContext = (): TableContextType | undefined => {
    return useContext(TableContext);
};

/**
 * هوك إلزامي للوصول لسياق الجدول الحالي.
 * يلقي استثناء إذا تم استخدامه خارج `<TableProvider />`.
 */
export const useTableContext = (): TableContextType => {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error("useTableContext must be used within a TableProvider");
    }
    return context;
};
