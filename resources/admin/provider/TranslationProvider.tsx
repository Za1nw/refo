import { usePage } from '@inertiajs/react';
import React, { useEffect } from 'react' ;

import { updateTranslations, i18n, Translations } from '@/i18n';

interface TranslationProviderProps {
    children: React.ReactNode;
}

// مزود مكون لترجمة i18n
export function TranslationProvider({ children }: TranslationProviderProps) {
    const { translations }  = usePage().props as unknown as { translations: Translations };
    useEffect(() => {
        if (translations && i18n.isInitialized) {
            updateTranslations(translations);
        }
    }, [translations]);

    return <>{children}</>;
}
