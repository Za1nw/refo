import { Loader2, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TranslationSearchProps = {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    onClear: () => void;
    isLoading?: boolean;
};

export default function TranslationSearch({
    value,
    onChange,
    onSearch,
    onClear,
    isLoading = false,
}: TranslationSearchProps) {
    const { t } = useTranslation('language');

    return (
        <div className="flex w-full items-center gap-2 sm:w-80 md:w-96">
            <div className="relative flex-1">
                <Input
                    placeholder={t('search_placeholder')}
                    value={value}
                    onChange={(event) => {
                        const nextValue = event.target.value;
                        onChange(nextValue);
                        if (nextValue.trim() === '') {
                            onClear();
                        }
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            onSearch(value);
                        }
                    }}
                    className="h-9 pe-8 ps-3 text-sm"
                />
                {value !== '' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute inset-e-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={onClear}
                        type="button"
                        title={t('clear_search')}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            <Button
                type="button"
                size="sm"
                variant="secondary"
                className="gap-1.5 h-9 px-3.5 rounded-lg shrink-0 border border-border/70 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onSearch(value)}
                disabled={isLoading}
                title={t('search_tooltip')}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Search className="h-4 w-4" />
                )}
                <span>{t('search')}</span>
            </Button>
        </div>
    );
}

