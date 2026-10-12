import type { ReactNode } from 'react';

import type { TranslationEntryRow } from '../types/translation-editor';

type TranslationListProps = {
    entries: TranslationEntryRow[];
    renderRow: (entry: TranslationEntryRow) => ReactNode;
    footer?: ReactNode;
};

export default function TranslationList({ entries, renderRow, footer }: TranslationListProps) {
    return (
        <div className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 px-1">
                <div>
                    <p className="text-base font-semibold text-foreground">قائمة الترجمات</p>
                    <p className="text-xs text-muted-foreground">عرض وتعديل مفاتيح الترجمة المتاحة</p>
                </div>
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {entries.length} عنصر
                </div>
            </div>

            <div className="space-y-4">
                {entries.map((entry) => (
                    <div key={entry.key}>
                        {renderRow(entry)}
                    </div>
                ))}
            </div>

            {footer && (
                <div className="pt-2">
                    {footer}
                </div>
            )}
        </div>
    );
}
