import { forwardRef } from 'react';

import { Textarea } from '@/components/ui/textarea';

type TranslationTextareaProps = {
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

const TranslationTextarea = forwardRef<HTMLTextAreaElement, TranslationTextareaProps>(function TranslationTextarea(
    { value, onChange, onFocus, onBlur, onKeyDown },
    ref,
) {
    return (
        <Textarea
            ref={ref}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onFocus={(event) => {
                event.stopPropagation();
                onFocus();
            }}
            onBlur={(event) => {
                event.stopPropagation();
                onBlur();
            }}
            onKeyDown={(event) => {
                event.stopPropagation();
                onKeyDown(event);
            }}
            rows={4}
            className="min-h-25 resize-y bg-background"
            placeholder="اكتب الترجمة هنا..."
            dir="auto"
        />
    );
});

export default TranslationTextarea;
