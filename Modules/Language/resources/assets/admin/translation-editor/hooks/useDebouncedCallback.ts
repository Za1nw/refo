import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedCallback<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delay = 300) {
    const timerRef = useRef<number | null>(null);

    useEffect(() => () => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
        }
    }, []);

    return useCallback((...args: TArgs) => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
        }

        timerRef.current = window.setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}
