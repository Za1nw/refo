import { useMemo } from 'react';
import { ChevronDown, ChevronUp, Copy, RotateCcw, Languages } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import type { TranslationEntryRow } from '../types/translation-editor';
import TranslationTextarea from './TranslationTextarea';

type TranslationRowProps = {
    entry: TranslationEntryRow;
    value: string;
    currentLocale: string;
    sourceLocale: string;
    showSource: boolean;
    isExpanded: boolean;
    isDirty: boolean;
    isActive: boolean;
    onToggleExpanded: (entryKey: string) => void;
    onChangeValue: (entryKey: string, value: string) => void;
    onReset: (entryKey: string) => void;
    onCopySource: (value: string) => void;
    onFocusKey: (entryKey: string | null) => void;
    onFocusNext: (entryKey: string) => void;
};

function TranslationRowComponent({
    entry,
    value,
    currentLocale,
    sourceLocale,
    showSource,
    isExpanded,
    isDirty,
    isActive,
    onToggleExpanded,
    onChangeValue,
    onReset,
    onCopySource,
    onFocusKey,
    onFocusNext,
}: TranslationRowProps) {
    const isEmpty = !value || value.trim() === '';

    const stateClassName = useMemo(() => {
        if (isActive) {
            return 'border-primary shadow-md ring-2 ring-primary/20';
        }

        if (isDirty || entry.is_overridden) {
            return 'border-orange-300 bg-orange-50/30 dark:border-orange-700 dark:bg-orange-950/20';
        }

        if (isEmpty) {
            return 'border-red-200 bg-red-50/20 dark:border-red-800 dark:bg-red-950/10';
        }

        return 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/10';
    }, [entry.is_overridden, isActive, isDirty, isEmpty]);

    return (
        <div className={`rounded-2xl border bg-card/90 transition-all duration-200 ${stateClassName}`}>
            <div
                role="button"
                tabIndex={0}
                className="group flex w-full cursor-pointer items-start gap-3 p-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                onClick={() => onToggleExpanded(entry.key)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onToggleExpanded(entry.key);
                    }
                }}
            >
                <div className="mt-1 shrink-0">
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronUp className="h-5 w-5 text-muted-foreground" />}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-sm font-semibold text-foreground">
                                {entry.key}
                            </span>
                            {isEmpty && <Badge variant="destructive" className="rounded-full text-[10px]">فارغ</Badge>}
                            {(isDirty || entry.is_overridden) && <Badge variant="outline" className="rounded-full border-orange-500 text-[10px] text-orange-600">معدل</Badge>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Languages className="h-3.5 w-3.5" />
                        <span>{sourceLocale} → {currentLocale}</span>
                    </div>

                    {!isExpanded && (
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {value || <span className="italic text-muted-foreground/50">لا توجد ترجمة...</span>}
                        </p>
                    )}
                </div>
            </div>

            {isExpanded && (
                <>
                    <Separator />
                    <div className="space-y-4 px-4 pb-4 pt-3">
                        {showSource && (
                            <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">النص المصدر ({sourceLocale})</span>
                                    <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={() => onCopySource(entry.source_value ?? '')}>
                                        <Copy className="h-3 w-3" />
                                        نسخ
                                    </Button>
                                </div>
                                <p className="text-sm leading-7 text-foreground/90">{entry.source_value || <span className="italic text-muted-foreground">—</span>}</p>
                            </div>
                        )}

                        <div className="space-y-3 rounded-2xl border border-border/60 bg-background p-3 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">الترجمة ({currentLocale})</Label>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        عدّل النص هنا، أو استرجع النص المصدر لهذا السطر متى احتجت.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs tabular-nums text-muted-foreground">{value.length} حرف</span>
                                    {(isDirty || entry.is_overridden) && (
                                        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 rounded-full px-3 text-xs" onClick={(event) => {
                                            event.stopPropagation();
                                            onReset(entry.key);
                                        }}>
                                            <RotateCcw className="h-3 w-3" />
                                            استعادة المصدر
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <TranslationTextarea
                                value={value}
                                onChange={(nextValue) => onChangeValue(entry.key, nextValue)}
                                onFocus={() => onFocusKey(entry.key)}
                                onBlur={() => onFocusKey(null)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Tab' && !event.shiftKey) {
                                        event.preventDefault();
                                        onFocusNext(entry.key);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function TranslationRow(props: TranslationRowProps) {
    return <TranslationRowComponent {...props} />;
}
