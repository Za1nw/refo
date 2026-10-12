import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

import { toUrl } from '@/lib/utils';

export function useActiveUrl() {
    const page = usePage();

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const currentUrlPath = new URL(page.url, origin).href;

    function normalizePathname(pathname: string): string {
        if (pathname.length > 1 && pathname.endsWith('/')) {
            return pathname.slice(0, -1);
        }

        return pathname;
    }

    function toAbsoluteUrl(url: string): URL {
        return new URL(url, origin);
    }

    function urlIsActive(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
    ) {

        const rawTarget = toUrl(urlToCheck);

        // الروابط الافتراضية (placeholder) لا تعتبر active.
        if (rawTarget === '#') {
            return false;
        }

        const target = toAbsoluteUrl(rawTarget);
        const current = toAbsoluteUrl(currentUrl ?? currentUrlPath);

        const targetPath = normalizePathname(target.pathname);
        const currentPath = normalizePathname(current.pathname);

        // إذا كان عنصر القائمة يحتوي query string نطلب تطابقًا كاملًا (path + query).
        // غير ذلك نتجاهل query params حتى تعتبر صفحات مثل /products?page=2 أن /products active.
        if (target.search && target.search !== '?') {
            return targetPath === currentPath && target.search === current.search;
        }

        return targetPath === currentPath;
    }

    return {
        currentUrl: currentUrlPath,
        urlIsActive,
    };
}
