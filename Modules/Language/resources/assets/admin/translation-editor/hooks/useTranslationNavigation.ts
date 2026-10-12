import { router } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';

import type { TranslationEditorQuery } from '../types/translation-editor';
import { createQueryString } from '../utils/compareQueries';
import { buildTranslationQuery } from '../utils/buildTranslationQuery';

type NavigationOptions = {
    preserveScroll?: boolean;
    preserveState?: boolean;
    replace?: boolean;
};

export function useTranslationNavigation(editUrl: string) {
    const [isNavigating, setIsNavigating] = useState(false);
    const [requestCount, setRequestCount] = useState(0);
    const lastQueryStringRef = useRef<string>('');

    const navigate = useCallback((query: TranslationEditorQuery, options: NavigationOptions = {}) => {
        const normalized = buildTranslationQuery(query);
        const queryString = createQueryString(normalized);

        if (lastQueryStringRef.current === queryString) {
            return;
        }

        lastQueryStringRef.current = queryString;
        setRequestCount((count) => count + 1);
        setIsNavigating(true);

        router.get(editUrl, normalized, {
            preserveScroll: options.preserveScroll ?? true,
            preserveState: options.preserveState ?? true,
            replace: options.replace ?? true,
            onFinish: () => setIsNavigating(false),
        });
    }, [editUrl]);

    return {
        isNavigating,
        requestCount,
        navigate,
    };
}
