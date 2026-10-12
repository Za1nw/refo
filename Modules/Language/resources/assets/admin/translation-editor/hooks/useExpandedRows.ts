import { useCallback, useMemo, useState } from 'react';

export function useExpandedRows(initialKeys: string[]) {
    const [expandedKeys, setExpandedKeys] = useState<string[]>(initialKeys);

    const expandedKeySet = useMemo(() => new Set(expandedKeys), [expandedKeys]);

    const isExpanded = useCallback((key: string) => expandedKeySet.has(key), [expandedKeySet]);

    const toggleRow = useCallback((key: string) => {
        setExpandedKeys((previous) => previous.includes(key) ? previous.filter((currentKey) => currentKey !== key) : [...previous, key]);
    }, []);

    const expandAll = useCallback((keys: string[]) => setExpandedKeys(keys), []);
    const collapseAll = useCallback(() => setExpandedKeys([]), []);

    return {
        expandedKeys,
        isExpanded,
        toggleRow,
        expandAll,
        collapseAll,
        setExpandedKeys,
    };
}
