import React, { JSX, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableProvider } from "@/context/TableContext";
import { selectTableSearch, selectTableViewMode, tableActions } from "@/features/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ButtonsActions, ColumnLabels } from "@/types/table";

import DialogComponenet from "./DialogComponenet";
import FilterSection from "./FilterSection";
import FooterTable from "./FooterTable";
import Table from "./Table";

/**
 * خيار نمط عرض الجدول (جدول، قائمة، أو كروت).
 */
export interface TableViewOption {
    /** القيمة المعرّفة للنمط (مثل 'table', 'list', 'cards') */
    value: string;
    /** التسمية التوضيحية للنمط */
    label: string;
    /** أيقونة النمط المرافقة */
    icon?: React.ReactNode;
    /** دالة تصيير مخصصة للواجهة عندما يكون هذا النمط نشطاً */
    render?: (context: { tableId: string; initHook: HookProps }) => React.ReactNode;
}

/**
 * كائن الخصائص الشامل المرجع من هوك الجدول (مثل `useTableBlog`, `useTableGovernorates`, ...).
 */
export interface HookProps {
    /** دالة إرسال البحث النصي */
    searchData?: (value: string) => void;
    /** هل كود التشغيل في جانب العميل */
    isClient: boolean;
    /** كائن جدول TanStack Table */
    table: any;
    /** مصفوفة الأعمدة المعرّفة */
    columns: any[];
    /** أنماط العرض المتاحة للجدول (اختياري) */
    views?: TableViewOption[];
    /** مكونات الفلاتر الإضافية المخصصة في التولبار */
    filterActions?: React.ReactNode;
    /** دالة فتح فورم الإنشاء */
    onCreate?: () => void;
    /** هل يدعم الجدول ميزة الإضافة؟ */
    hasCreate?: boolean;
    /** هل يجب إظهار زر الإضافة؟ */
    showCreate?: boolean;
    /** تلميح أو تسمية زر الإضافة */
    createTooltip?: string;
    createLabel?: string;
    createIcon?: React.ReactNode;
    /** دالة النقر على الصف */
    handleRowClick?: () => void;
    /** كائن الإجراءات المتاحة للصفوف */
    actions?: ButtonsActions;
    /** أي خصائص أو فلاتر إضافية خاصة بالمورد */
    [key: string]: any;
}

/**
 * خصائص المكون العام `SectionListGeneric`.
 */
export interface SectionListGenericProps {
    /** محتوى رأس البطاقة المخصص (مثل نموذج فلترة متقدم إضافي) */
    children?: React.ReactNode;
    /** المعرّف الفريد للجدول في Redux */
    tableId: string;
    /** كائن الخصائص الراجع من هوك المورد */
    initHook: HookProps;
    /** تسميات الأعمدة المترجمة لعرضها في حوار التفاصيل وتخصيص الأعمدة */
    columnLabels?: Record<string, ColumnLabels>;
    /**
     * التحكم الصريح في إظهار أو إخفاء زر الإضافة:
     * إذا تم ضبطه على `false`، فسيتم إخفاء زر الإضافة من التولبار تماماً حتى وإن وُجدت دالة `onCreate`.
     */
    showCreate?: boolean;
    /** تلميح زر الإضافة */
    createTooltip?: string;
    /** نص زر الإضافة */
    createLabel?: string;
    /** أيقونة زر الإضافة */
    createIcon?: React.ReactNode;
}

/**
 * تحديد نمط العرض الفعلي بشكل آمن:
 * إذا كان النمط المخزن في Redux غير مدعوم في قائمة `views` الحالية، يتم الرجوع للنمط الأول المتاح.
 */
function resolveActiveViewMode(views: TableViewOption[] | undefined, viewMode: string): string | undefined {
    if (!views || views.length === 0) {
        return undefined;
    }

    const isCurrentViewStillValid = views.some((view) => view.value === viewMode);
    return isCurrentViewStillValid ? viewMode : views[0].value;
}

/**
 * المكون الحاوي العام لكافة جداول ولوحات التحكم (`SectionListGeneric`):
 *
 * يوفر معمارية متكاملة تشمل:
 * 1. شريط الأدوات العلوي (`FilterSection`): البحث، الفلاتر، تبديل أنماط العرض، وزر الإضافة الشرطي.
 * 2. دعم أنماط العرض المتعددة (`Table`, `List`, `Cards`) مع التبديل السلس والحفاظ على الحالة.
 * 3. شريط التصفح السفلي (`FooterTable`): تصفح الصفحات وتغيير عدد السجلات.
 * 4. حوار تفاصيل السجل وتخصيص الأعمدة (`DialogComponenet`).
 * 5. توفير سياق الجدول لجميع المكونات الفرعية عبر `TableProvider`.
 */
export default function SectionListGeneric({
    children,
    tableId,
    columnLabels,
    initHook,
    showCreate,
    createTooltip,
    createLabel,
    createIcon,
}: SectionListGenericProps): JSX.Element {
    const dispatch = useAppDispatch();
    const search = useAppSelector((state) => selectTableSearch(state, tableId));
    const viewMode = useAppSelector((state) => selectTableViewMode(state, tableId));
    const { t } = useTranslation("main");

    // استخدام دالة البحث القادمة من الهوك أو التراجع لتحديث Redux محلياً
    const onSearch =
        initHook.searchData ?? ((value: string) => dispatch(tableActions.setSearch({ tableId, search: value })));

    const { views } = initHook;
    const resolvedViewMode = resolveActiveViewMode(views, viewMode);
    const activeView = views?.find((view) => view.value === resolvedViewMode);

    // تحديد إظهار زر الإضافة (من الـ props المباشرة أو من كائن initHook)
    const isCreateVisible = showCreate ?? initHook.showCreate ?? (initHook.hasCreate !== false && Boolean(initHook.onCreate));

    // زر تبديل نمط العرض الدائري
    const viewToggle = useMemo(() => {
        if (!views || views.length <= 1) {
            return null;
        }

        const activeIndex = Math.max(0, views.findIndex((view) => view.value === resolvedViewMode));
        const nextView = views[(activeIndex + 1) % views.length];

        return {
            label: activeView?.label,
            icon: activeView?.icon,
            onClick: () => dispatch(tableActions.setViewMode({ tableId, viewMode: nextView.value })),
        };
    }, [activeView?.icon, activeView?.label, dispatch, resolvedViewMode, tableId, views]);

    // تجهيز قيم سياق الجدول المشترك
    const tableContextValue = useMemo(
        () => ({
            tableId,
            visibleColumns: [],
            handleRowClick: initHook.handleRowClick,
            actions: initHook.actions,
            onCreate: isCreateVisible ? initHook.onCreate : undefined,
            hasCreate: isCreateVisible,
            showCreate: isCreateVisible,
        }),
        [initHook.actions, initHook.handleRowClick, initHook.onCreate, isCreateVisible, tableId],
    );

    // تحديد ما إذا كان يجب تصيير واجهة مخصصة (مثل Cards أو List)
    const shouldRenderCustomView =
        !!views && views.length > 0 && resolvedViewMode !== "table" && typeof activeView?.render === "function";

    return (
        <TableProvider value={tableContextValue}>
            <Card className="">
                {/* قسم الفلترة الإضافي المخصص أعلى الجدول إن وُجد */}
                {children && (
                    <CardHeader className="border-b pb-4 border-accent">
                        <CardTitle> {t("Filter")} </CardTitle>
                        {children}
                    </CardHeader>
                )}

                {/* شريط البحث والفلترة وأزرار التحكم */}
                <FilterSection
                    tableId={tableId}
                    search={search}
                    onSearch={onSearch}
                    onCreate={initHook.onCreate}
                    showCreate={isCreateVisible}
                    createTooltip={createTooltip ?? initHook.createTooltip}
                    createLabel={createLabel ?? initHook.createLabel}
                    createIcon={createIcon ?? initHook.createIcon}
                    extraActions={initHook.filterActions}
                    viewToggle={viewToggle}
                />

                {/* محتوى الجدول أو الواجهة البديلة */}
                <CardContent>
                    {shouldRenderCustomView ? (
                        <>
                            {initHook.isClient ? activeView?.render?.({ tableId, initHook }) : null}
                            {initHook.isClient && initHook.table ? (
                                <div className="mt-3">
                                    <FooterTable table={initHook.table} tableId={tableId} />
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <Table
                            tableId={tableId}
                            columns={initHook.columns}
                            table={initHook.table}
                            isClient={initHook.isClient}
                            initHook={initHook}
                        />
                    )}

                    {/* مربع حوار تفاصيل السجل المحدد وتخصيص الأعمدة */}
                    <DialogComponenet tableId={tableId} columnLabels={columnLabels} />
                </CardContent>
            </Card>
        </TableProvider>
    );
}
