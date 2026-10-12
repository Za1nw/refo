import { ArrowLeft, Eye, FileText, Languages, RotateCcw, Save, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import TranslationSearch from './TranslationSearch';

type TranslationToolbarProps = {
    fileLabel: string;
    fileGroup: string;
    fileNamespace?: string;
    sourceLocale: string;
    currentLocale: string;
    availableLocales: string[];
    showSource: boolean;
    searchTerm: string;
    isLoading: boolean;
    requestCount: number;
    progressPercentage: number;
    translatedEntries: number;
    totalEntries: number;
    emptyEntries: number;
    dirtyCount: number;
    onBack: () => void;
    onLocaleChange: (value: string) => void;
    onToggleSource: () => void;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (value: string) => void;
    onSearchClear: () => void;
    onRestoreAll: () => void;
    onSave: () => void;
};

export default function TranslationToolbar({
    fileLabel,
    fileGroup,
    fileNamespace,
    sourceLocale,
    currentLocale,
    availableLocales,
    showSource,
    searchTerm,
    isLoading,
    requestCount,
    progressPercentage,
    translatedEntries,
    totalEntries,
    emptyEntries,
    dirtyCount,
    onBack,
    onLocaleChange,
    onToggleSource,
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    onRestoreAll,
    onSave,
}: TranslationToolbarProps) {
    return (
        <div className="sticky top-0 z-20 space-y-4 bg-background/90 pb-4 pt-2 backdrop-blur supports-backdrop-filter:bg-background/80">
            <Card className="overflow-hidden border border-border/70 shadow-[0_16px_50px_-24px_rgba(0,0,0,0.45)]">
                <div className="h-1 bg-linear-to-r from-primary via-sky-500 to-emerald-500" />
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                        <Languages className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-2xl font-semibold tracking-tight">{fileLabel}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
                                    <Languages className="mr-1.5 h-3.5 w-3.5" />
                                    {sourceLocale} → {currentLocale}
                                </Badge>
                                {isLoading && <Badge variant="outline" className="ml-2 rounded-full text-xs">جاري التحميل ({requestCount})</Badge>}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>{fileGroup}</span>
                                {fileNamespace && (
                                    <>
                                        <span className="text-muted-foreground/50">•</span>
                                        <span>{fileNamespace}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <Button variant="outline" onClick={onBack} className="shrink-0 self-start rounded-full border-border/70 lg:self-center">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            العودة للقائمة
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="w-full sm:w-48">
                                <Select value={currentLocale} onValueChange={onLocaleChange}>
                                    <SelectTrigger className="h-10">
                                        <Languages className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableLocales.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 shadow-sm">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <Switch checked={showSource} onCheckedChange={onToggleSource} />
                                <span className="text-sm">إظهار المصدر</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
                            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${progressPercentage === 100 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">تقدم الترجمة</p>
                                        <p className="text-sm font-semibold tabular-nums">{translatedEntries} / {totalEntries}</p>
                                    </div>
                                </div>
                                <div className="mt-3 grid h-2 w-48 grid-cols-10 gap-1 overflow-hidden rounded-full bg-muted p-0.5">
                                    {Array.from({ length: 10 }).map((_, index) => {
                                        const isFilled = index < Math.max(1, Math.ceil(progressPercentage / 10));
                                        const fillClass = progressPercentage === 100
                                            ? 'bg-emerald-500'
                                            : progressPercentage > 50
                                                ? 'bg-sky-500'
                                                : 'bg-orange-500';

                                        return (
                                            <span
                                                key={index}
                                                className={`rounded-full transition-colors duration-300 ${isFilled ? fillClass : 'bg-transparent'}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {emptyEntries > 0 && <Badge variant="outline" className="rounded-full border-orange-500 text-orange-600">{emptyEntries} فارغ</Badge>}

                                {dirtyCount > 0 && <Badge variant="outline" className="rounded-full border-orange-500 text-orange-600">{dirtyCount} تعديل</Badge>}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/90 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <TranslationSearch
                    value={searchTerm}
                    onChange={onSearchChange}
                    onSearch={onSearchSubmit}
                    onClear={onSearchClear}
                    isLoading={isLoading}
                />

                <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="gap-2 rounded-full px-5" onClick={onRestoreAll}>
                        <RotateCcw className="h-4 w-4" />
                        استعادة المصدر للكل
                    </Button>

                    <Button type="button" size="sm" className="gap-2 rounded-full px-5" onClick={onSave} disabled={dirtyCount === 0}>
                        <Save className="h-4 w-4" />
                        حفظ الترجمات
                    </Button>
                </div>
            </div>
        </div>
    );
}
