import React from "react";
import { Copy, Check, Calendar, FileText, Hash, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, isIsoDate } from "@/lib/utils";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ColumnLabels } from "@/types/table";
import { selectTableSelectedRow, tableActions } from "@/features/table";

interface DialogComponentProps {
    tableId: string;
    columnLabels?: Record<string, ColumnLabels>;
}

type SelectedRow = Record<string, unknown>;

export default function DialogComponent({
    tableId,
    columnLabels = {},
}: DialogComponentProps): React.JSX.Element {
    const dispatch = useAppDispatch();
    const resolvedSelectedRow = useAppSelector(
        (state) => selectTableSelectedRow(state, tableId) as SelectedRow | null,
    );
    const [copiedField, setCopiedField] = React.useState<string | null>(null);

    const close = () => {
        dispatch(tableActions.clearSelectedRow({ tableId }));
    };

    const handleCopy = async (text: string, fieldKey: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldKey);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // الفلترة تتم هنا، قبل أي رسم — الحقول المخفية لا تدخل
    // إلى الشجرة نهائيًا، فلا تترك فراغًا ولا أي أثر بصري
    const visibleFields = resolvedSelectedRow
        ? Object.entries(resolvedSelectedRow).filter(([key]) => !columnLabels[key]?.hidden)
        : [];

    const totalFieldsCount = resolvedSelectedRow ? Object.keys(resolvedSelectedRow).length : 0;
    const hasRow = !!resolvedSelectedRow;
    const hasVisibleFields = visibleFields.length > 0;

    return (
        <Dialog open={hasRow} onOpenChange={close}>
            <DialogContent className="max-w-2xl lg:max-w-3xl xl:max-w-4xl p-0 gap-0 overflow-hidden border-border/50 bg-background shadow-2xl shadow-black/10">
                {/* Header */}
                <DialogHeader className="relative px-5 sm:px-6 py-4 sm:py-5 border-b border-border/60">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 ring-1 ring-primary/15 shrink-0">
                            <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight truncate">
                                تفاصيل العنصر
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {hasVisibleFields
                                    ? `${visibleFields.length} حقل متاح للعرض`
                                    : "عرض تفصيلي للعنصر المحدد"}
                            </DialogDescription>
                        </div>
                    </div>
                    {/* خط تمييز رفيع أسفل الهيدر */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
                </DialogHeader>

                {/* Content */}
                <div className="overflow-y-auto max-h-[55vh] sm:max-h-[60vh] lg:max-h-[70vh] [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.25)_transparent]">
                    <div className="p-3.5 sm:p-5 lg:p-6">
                        {hasRow ? (
                            hasVisibleFields ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                                    {visibleFields.map(([key, value], index) => (
                                        <div
                                            key={key}
                                            className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                                            style={{ animationDelay: `${index * 35}ms`, animationFillMode: "both" }}
                                        >
                                            <DialogFieldRow
                                                fieldKey={key}
                                                value={value}
                                                config={columnLabels[key]}
                                                isCopied={copiedField === key}
                                                onCopy={(text) => handleCopy(text, key)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // لا توجد حقول مرئية: لا نعرض أي شيء على الإطلاق،
                                // ولا حتى رسالة أو أيقونة — صفحة فاضية تمامًا بدون أي تلميح
                                <div className="h-24" />
                            )
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </div>

                {/* Footer */}
                {hasRow && hasVisibleFields && (
                    <div className="px-5 sm:px-6 py-3 border-t border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <StatPill icon={<Hash className="w-3 h-3" />} label="الحقول المعروضة" value={visibleFields.length} />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border/60 text-xs text-muted-foreground">
            <span className="text-primary/70">{icon}</span>
            <span>{label}</span>
            <span className="font-semibold text-foreground tabular-nums">{value}</span>
        </span>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground">
            <div className="p-3.5 rounded-2xl bg-muted/40 mb-3.5">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 opacity-30" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-foreground/80">لا توجد بيانات للعرض</p>
            <p className="text-xs sm:text-sm mt-1">يرجى تحديد عنصر من الجدول</p>
        </div>
    );
}

/**
 * صف حقل واحد، مع إمكانية النسخ وتصميم متجاوب
 */
function DialogFieldRow({
    fieldKey,
    value,
    config,
    isCopied,
    onCopy,
}: {
    fieldKey: string;
    value: unknown;
    config?: ColumnLabels;
    isCopied?: boolean;
    onCopy?: (text: string) => void;
}) {
    const colConfig = (config ?? {}) as ColumnLabels;
    if(colConfig.accessorFn) {
        value = colConfig.accessorFn(value);
    }
    const isEmpty = value === null || value === undefined;
    const stringValue = renderValueAsString(value);
    const canCopy = !isEmpty && stringValue.length > 0;

    return (
        <div className="group relative flex rounded-lg border border-border/60 bg-card/60 hover:bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-150">
            {/* شريط تمييز جانبي بدل النقطة، يتفاعل مع hover */}
            <div className="w-1 rounded-r-sm sm:rounded-r-none sm:rounded-l-lg bg-border/70 group-hover:bg-primary/60 transition-colors duration-150 shrink-0" />

            <div className="flex-1 min-w-0 p-2.5 sm:p-3.5">
                {/* Label */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
                        {colConfig.label || fieldKey}
                    </span>

                    {canCopy && onCopy && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 flex-shrink-0 -mt-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCopy(stringValue);
                                        }}
                                    >
                                        {isCopied ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">{isCopied ? "تم النسخ!" : "نسخ القيمة"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {/* Value */}
                <div className="min-h-[1.5rem] flex items-start gap-2">
                    {colConfig.prefix && !isEmpty && (
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded flex-shrink-0 opacity-70 mt-0.5">
                            {colConfig.prefix}
                        </span>
                    )}

                    <div className="flex-1 min-w-0">{renderFieldValue(value, colConfig)}</div>

                    {colConfig.suffix && !isEmpty && (
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded flex-shrink-0 opacity-70 mt-0.5">
                            {colConfig.suffix}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * تحويل أي قيمة إلى نص جاهز للنسخ.
 * نستخدم JSON.stringify بدل String() مع الـ objects، لأن String(object)
 * يعطي "[object Object]" بدون أي فائدة عند النسخ.
 */
function renderValueAsString(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === "object" && item !== null ? JSON.stringify(item) : String(item)))
            .join(", ");
    }
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
}

/**
 * عرض قيمة الحقل بالشكل المناسب لنوعها
 */
function renderFieldValue(value: unknown, colConfig: ColumnLabels) {
    if (typeof colConfig.render === "function") {
        return <div className="text-sm">{colConfig.render(value)}</div>;
    }

    if (Array.isArray(value)) {
        return <ArrayBadgeList items={value} />;
    }

    if (value === null || value === undefined) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-muted-foreground/70 text-xs font-medium">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                غير معرف
            </span>
        );
    }

    if (typeof value === "boolean") {
        return value ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                نعم
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                <XCircle className="w-3.5 h-3.5" />
                لا
            </span>
        );
    }

    if (typeof value === "string" && isIsoDate(value)) {
        return (
            <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs sm:text-sm font-mono truncate">{formatDate(value)}</span>
            </div>
        );
    }

    if (typeof value === "object") {
        return (
            <pre className="text-xs bg-muted/50 p-2 sm:p-2.5 rounded-md overflow-x-auto font-mono max-h-32 overflow-y-auto">
                {JSON.stringify(value, null, 2)}
            </pre>
        );
    }

    if (typeof value === "number") {
        return <span className="text-xs sm:text-sm font-mono tabular-nums text-foreground/90">{value.toLocaleString("ar")}</span>;
    }

    const stringValue = String(value);
    const isUrl = /^https?:\/\//.test(stringValue);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue);
    const isLongText = stringValue.length > 100;

    if (isUrl) {
        return (
            <a
                href={stringValue}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-primary hover:underline break-all inline-flex items-center gap-1"
            >
                {stringValue}
                <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
            </a>
        );
    }

    if (isEmail) {
        return (
            <a href={`mailto:${stringValue}`} className="text-xs sm:text-sm text-primary hover:underline break-all">
                {stringValue}
            </a>
        );
    }

    return (
        <span
            className={`text-xs sm:text-sm break-all leading-relaxed text-foreground/90 ${
                isLongText ? "line-clamp-3 hover:line-clamp-none transition-all duration-200" : ""
            }`}
        >
            {stringValue}
        </span>
    );
}

/**
 * عرض المصفوفات كـ badges.
 * الإصلاح: العناصر من نوع object تُحوَّل بـ JSON.stringify بدل String()
 * (التي كانت تعطي "[object Object]").
 */
function ArrayBadgeList({ items }: { items: unknown[] }) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const maxVisibleItems = 5;
    const hasMoreItems = items.length > maxVisibleItems;
    const visibleItems = isExpanded ? items : items.slice(0, maxVisibleItems);

    if (items.length === 0) {
        return <span className="text-xs text-muted-foreground italic">مصفوفة فارغة</span>;
    }

    const formatItem = (item: unknown): string => {
        if (item === null || item === undefined) return "—";
        if (typeof item === "object") return JSON.stringify(item);
        return String(item);
    };

    return (
        <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {visibleItems.map((item, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center max-w-full px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/15 transition-colors duration-150 hover:bg-primary/15"
                        title={formatItem(item)}
                    >
                        <span className="truncate">{formatItem(item)}</span>
                    </span>
                ))}
            </div>
            {hasMoreItems && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-primary hover:underline transition-colors"
                >
                    {isExpanded ? "عرض أقل" : `+${items.length - maxVisibleItems} عناصر إضافية`}
                </button>
            )}
        </div>
    );
}
