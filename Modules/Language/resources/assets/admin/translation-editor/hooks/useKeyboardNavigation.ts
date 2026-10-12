import { useCallback } from 'react';

export function useKeyboardNavigation(onFocusNext: (currentKey: string) => void) {
    return useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>, currentKey: string) => {
        if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            onFocusNext(currentKey);
        }
    }, [onFocusNext]);
}
