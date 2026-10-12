import { Copy, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type TranslationActionsProps = {
    onCopySource: () => void;
    onReset: () => void;
};

export default function TranslationActions({ onCopySource, onReset }: TranslationActionsProps) {
    return (
        <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full px-3 text-xs" onClick={(event) => {
                event.stopPropagation();
                onCopySource();
            }}>
                <Copy className="h-3.5 w-3.5" />
                نسخ المصدر
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full px-3 text-xs" onClick={(event) => {
                event.stopPropagation();
                onReset();
            }}>
                <RotateCcw className="h-3.5 w-3.5" />
                استعادة المصدر
            </Button>
        </div>
    );
}
