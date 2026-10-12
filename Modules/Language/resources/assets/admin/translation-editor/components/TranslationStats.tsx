import { AlertCircle, CheckCircle2, FileText, History, Languages } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type TranslationStatsProps = {
    totalEntries: number;
    translatedEntries: number;
    emptyEntries: number;
    progressPercentage: number;
    modifiedEntries: number;
    modifiedPercentage: number;
    unsavedEntries: number;
};

export default function TranslationStats({ totalEntries, translatedEntries, emptyEntries, progressPercentage, modifiedEntries, modifiedPercentage, unsavedEntries }: TranslationStatsProps) {
    return (
        <div className="grid gap-4 lg:grid-cols-4">
            <Card className="overflow-hidden border-border/70">
                <div className="h-1 bg-primary" />
                <CardContent className="flex items-center gap-3 py-4">
                    <div className="rounded-2xl bg-primary/10 p-2.5">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{totalEntries}</p>
                        <p className="text-xs text-muted-foreground">مفتاح ترجمة</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70">
                <div className="h-1 bg-emerald-500" />
                <CardContent className="flex items-center gap-3 py-4">
                    <div className="rounded-2xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
                        <Languages className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{translatedEntries}</p>
                        <p className="text-xs text-muted-foreground">مكتمل</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70">
                <div className={`h-1 ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <CardContent className="flex items-center gap-3 py-4">
                    <div className={`rounded-2xl p-2.5 ${progressPercentage === 100 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        {progressPercentage === 100 ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-2xl font-bold tabular-nums">{progressPercentage}%</p>
                        <p className="text-xs text-muted-foreground">نسبة الإنجاز</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70">
                <div className="h-1 bg-orange-500" />
                <CardContent className="flex items-center gap-3 py-4">
                    <div className="rounded-2xl bg-orange-100 p-2.5 dark:bg-orange-900/30">
                        <History className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-2xl font-bold tabular-nums">{modifiedEntries}</p>
                        <p className="text-xs text-muted-foreground">النصوص المعدلة</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="rounded-full border-orange-500 text-orange-600">
                                نسبة التعديل {modifiedPercentage}%
                            </Badge>
                            {unsavedEntries > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {unsavedEntries} غير محفوظ
                                </span>
                            )}
                            {emptyEntries > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {emptyEntries} فارغ
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
