import { PlusIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface FilterSectionProps {
    /** معرّف الجدول في Redux */
    tableId: string;
    /** نص البحث الحالي */
    search: string;
    /** معالج إرسال نص البحث */
    onSearch: (value: string) => void;
    /** دالة فتح فورم الإنشاء (اختياري) */
    onCreate?: () => void;
    /**
     * التحكم في إظهار أو إخفاء زر الإضافة.
     * إذا كانت القيمة `false`، فلن يظهر زر الإضافة أبداً.
     * الافتراضي: يتم إظهاره إذا كانت دالة `onCreate` متوفرة.
     */
    showCreate?: boolean;
    /** نص أو تلميح زر الإضافة المخصص */
    createTooltip?: string;
    /** نص زر الإضافة إذا كان معروضاً بنص */
    createLabel?: string;
    /** أيقونة زر الإضافة المخصصة */
    createIcon?: ReactNode;
    /** مكونات أو أزرار فلاتر إضافية (قوائم منسدلة، تواريخ...) */
    extraActions?: ReactNode;
    /** إعدادات زر تبديل نمط العرض (جدول / قائمة / كروت) */
    viewToggle?: {
        label?: string;
        icon?: ReactNode;
        onClick: () => void;
    } | null;
}

/**
 * شريط أدوات أعلى الجدول (`FilterSection`):
 *
 * يحتوي على:
 * 1. خانة البحث النصي اليدوي (`SearchBox`): لا ترسل الطلب مع كل حرف لتوفير الأداء، بل عند الضغط على `Enter` أو زر المسح.
 * 2. زر تبديل نمط العرض (`viewToggle`): التنقل بين الجداول والقوائم والكروت.
 * 3. الفلاتر المخصصة (`extraActions`): فلاتر الحالة، التصنيفات، التواريخ... إلخ.
 * 4. زر الإضافة الذكي (`onCreate`): يظهر فقط عند تفعيل ميزة الإضافة وتوفر دالة `onCreate` مع دعم التخصيص الكامل.
 */
export default function FilterSection({
    tableId,
    search,
    onSearch,
    onCreate,
    showCreate,
    createTooltip,
    createLabel,
    createIcon,
    extraActions,
    viewToggle,
}: FilterSectionProps) {
    const { t } = useTranslation("main");

    // تحديد ما إذا كان زر الإضافة يجب أن يظهر
    const isCreateVisible = (showCreate ?? Boolean(onCreate)) && Boolean(onCreate);

    return (
        <div className="flex flex-wrap justify-between gap-4 mx-6">
            {/* حقل البحث النصي اليدوي */}
            <SearchBox tableId={tableId} search={search} onSearch={onSearch} />

            {/* الإجراءات وأزرار التحكم */}
            <div className="flex flex-wrap items-center gap-4">
                {/* زر تبديل نمط العرض (Table / List / Cards) */}
                {viewToggle ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-fit"
                                aria-label={viewToggle.label ?? t("Change view")}
                                onClick={viewToggle.onClick}
                            >
                                {viewToggle.icon}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <span className="text-sm">{viewToggle.label ?? t("Change view")}</span>
                        </TooltipContent>
                    </Tooltip>
                ) : null}

                {/* الفلاتر المخصصة للمورد */}
                {extraActions}

                {/* زر الإضافة (يظهر فقط إذا كان isCreateVisible مفعلاً) */}
                {isCreateVisible && onCreate ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-fit gap-1"
                                aria-label={createTooltip ?? createLabel ?? t("Add new")}
                                onClick={onCreate}
                            >
                                {createIcon ?? <PlusIcon size={16} />}
                                {createLabel ? <span>{createLabel}</span> : null}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <span className="text-sm">{createTooltip ?? createLabel ?? t("Add new")}</span>
                        </TooltipContent>
                    </Tooltip>
                ) : null}
            </div>
        </div>
    );
}

/**
 * مكون حقل البحث النصي المنفصل (`SearchBox`):
 *
 * يدير حالته المحلية بشكل منفصل عن حالة الجدول في Redux:
 * - يتيح للمستخدم الكتابة بحرية دون إرسال طلبات متكررة للسيرفر.
 * - يُرسل الطلب فقط عند الضغط على مفتاح `Enter`.
 * - يوفر زر مسح سريع `X` لإلغاء البحث وإعادة جلب البيانات الأصلية فوراً.
 */
function SearchBox({
    tableId,
    search,
    onSearch,
}: {
    tableId: string;
    search: string;
    onSearch: (value: string) => void;
}) {
    const { t } = useTranslation("main");
    const [value, setValue] = useState(search);
    const [isSearch, setIsSearch] = useState(false);

    // مزامنة الحقل مع أي تغيير خارجي على قيمة البحث (مثلاً عبر الرابط أو التهيئة)
    useEffect(() => {
        setValue(search);
        setIsSearch(search !== "");
    }, [search]);

    /**
     * مسح نص البحث وإعادة جلب البيانات فوراً
     */
    const clearSearch = () => {
        setValue("");
        onSearch("");
        setIsSearch(false);
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="relative max-w-60 min-w-25">
                <Input
                    id={`${tableId}-search`}
                    className="pe-10"
                    placeholder={t("Search...")}
                    value={value}
                    type="text"
                    onChange={(e) => {
                        setValue(e.currentTarget.value);
                        // إذا تم مسح النص بالكامل وكان هناك بحث نشط، يتم إعادة جلب البيانات
                        if (e.currentTarget.value === "" && isSearch) {
                            onSearch("");
                            setIsSearch(false);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSearch(value);
                            setIsSearch(value.trim() !== "");
                        }
                    }}
                />
                {value ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute inset-e-1 top-1/2 -translate-y-1/2"
                        aria-label={t("Clear search")}
                        onClick={clearSearch}
                    >
                        <XIcon size={14} />
                    </Button>
                ) : null}
            </div>
            <span className="text-muted-foreground text-xs">{t("Press Enter to search")}</span>
        </div>
    );
}
