import { type NavGroup, type NavItem } from '@/types';

import {
    type MenuBuilderMenuGroup,
    type MenuBuilderMenuItem,
    type SidebarMenuResponse,
} from '../types/sidebar-menu';

export const emptySidebarMenu: SidebarMenuResponse = { main: [], footer: [] };

let cachedSidebarMenu: SidebarMenuResponse | null = null;
let inFlightSidebarMenuRequest: Promise<SidebarMenuResponse> | null = null;

const sidebarMenuInvalidatedEvent = 'menubuilder:sidebar-menu:invalidated';

/**
 * يرجّع آخر قائمة Sidebar مخزّنة في الذاكرة (in-memory) إن وُجدت.
 *
 * ملاحظة: هذا كاش على مستوى التبويب الحالي فقط (ليس persistent).
 */
export function getCachedSidebarMenu(): SidebarMenuResponse | null {
    return cachedSidebarMenu;
}

/**
 * يمسح كاش قائمة الـSidebar والطلب الجاري (إن وجد)، ثم يطلق حدث invalidation في المتصفح.
 *
 * يُستخدم هذا عندما تتغير القائمة (مثلاً بعد تعديل عناصر MenuBuilder) حتى تُعاد قراءتها من الـAPI.
 */
export function clearSidebarMenuCache(): void {
    cachedSidebarMenu = null;
    inFlightSidebarMenuRequest = null;

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(sidebarMenuInvalidatedEvent));
    }
}

/**
 * يجلب قائمة الـSidebar من الـAPI مع:
 * - dedupe: منع تكرار نفس الطلب أثناء وجود طلب قيد التنفيذ.
 * - cache: حفظ النتيجة في الذاكرة لتجنّب إعادة الجلب عند تنقّل Inertia.
 *
 * `force`: يمسح الكاش والطلب الجاري ثم يجلب من جديد.
 * عند أي خطأ: يرجّع قائمة فارغة (emptySidebarMenu).
 */
export async function getSidebarMenuFromApi(options?: {
    force?: boolean;
    throwOnError?: boolean;
}): Promise<SidebarMenuResponse> {
    if (options?.force) {
        cachedSidebarMenu = null;
        inFlightSidebarMenuRequest = null;
    }

    if (cachedSidebarMenu) {
        return cachedSidebarMenu;
    }

    if (inFlightSidebarMenuRequest) {
        return inFlightSidebarMenuRequest;
    }

    inFlightSidebarMenuRequest = fetch('/api/v1/sidebar-menu', {
        headers: {
            Accept: 'application/json',
        },
        credentials: 'same-origin',
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Sidebar menu request failed: ${response.status}`);
            }

            return (await response.json()) as unknown;
        })
        .then((payload) => {
            const normalized = normalizeSidebarMenu(payload);
            cachedSidebarMenu = normalized;

            return normalized;
        })
        .catch((error: unknown) => {
            if (options?.throwOnError) {
                throw error;
            }

            return emptySidebarMenu;
        })
        .finally(() => {
            inFlightSidebarMenuRequest = null;
        });

    return inFlightSidebarMenuRequest;
}

/**
 * يستمع لحدث invalidation الخاص بقائمة الـSidebar.
 *
 * يرجّع دالة cleanup لإلغاء الاستماع (مهم داخل useEffect).
 */
export function onSidebarMenuInvalidated(callback: () => void): () => void {
    if (typeof window === 'undefined') {
        return () => { };
    }

    window.addEventListener(sidebarMenuInvalidatedEvent, callback);

    return () => {
        window.removeEventListener(sidebarMenuInvalidatedEvent, callback);
    };
}

/**
 * يطبّع (normalize) شكل الـpayload القادم من السيرفر إلى الشكل الذي نتوقعه في الواجهة.
 *
 * يدعم شكلين شائعين:
 * - `{ main, footer }`
 * - `{ data: { main, footer } }`
 */
export function normalizeSidebarMenu(payload: unknown): SidebarMenuResponse {
    if (!payload || typeof payload !== 'object') {
        return emptySidebarMenu;
    }

    const root = payload as Record<string, unknown>;

    const data =
        (root.main && root.footer
            ? root
            : (root.data as Record<string, unknown> | undefined)) ?? root;

    const main = Array.isArray((data as Record<string, unknown>).main)
        ? ((data as Record<string, unknown>).main as MenuBuilderMenuGroup[])
        : [];

    const footer = Array.isArray((data as Record<string, unknown>).footer)
        ? ((data as Record<string, unknown>).footer as MenuBuilderMenuItem[])
        : [];

    return { main, footer };
}

type IconResolver = (icon?: string | null) => NavItem['icon'];

/**
 * يحوّل عنصر MenuBuilder واحد إلى NavItem قابل للعرض في Sidebar.
 *
 * - يتجاهل `divider`.
 * - يتجاهل العناصر بدون `href` (غير قابلة للنقر).
 * - يحوّل `children` إلى `items` بشكل recursive لدعم dropdown.
 */
function toNavItem(
    item: MenuBuilderMenuItem,
    resolveIcon: IconResolver,
): NavItem | null {
    if (item.type === 'divider') {
        return null;
    }

    const children = (item.children ?? [])
        .map((child) => toNavItem(child, resolveIcon))
        .filter((child): child is NavItem => child !== null);

    const hasChildren = children.length > 0;

    // عناصر الـDropdown (وأي عنصر لديه children) قد لا تملك href بشكل مقصود.
    // نبقيها حتى يتمكن الـUI من عرض زر فتح/إغلاق، ونستخدم رابطًا افتراضيًا آمنًا.
    const href = item.href ?? '#';

    // إذا كان العنصر leaf ولا يملك href، نعرضه كـ disabled بدلًا من إخفائه.
    // هذا يمنع ظهور القائمة وكأنها ناقصة عندما يرجع الـAPI عناصر بدون روابط صالحة.
    const disabled = Boolean(item.disabled) || (!hasChildren && !item.href);

    return {
        id: item.id,
        title: item.title,
        href,
        icon: resolveIcon(item.icon),
        disabled,
        items: hasChildren ? children : undefined,
    };
}

/**
 * يحوّل قائمة MenuBuilder (items) إلى NavItem[] للاستخدام داخل مكوّنات الـSidebar.
 *
 * يفلتر العناصر غير القابلة للعرض (مثل divider أو بدون href).
 */
export function menuItemsToNavItems(
    items: MenuBuilderMenuItem[],
    resolveIcon: IconResolver,
): NavItem[] {
    return items
        .map((item) => toNavItem(item, resolveIcon))
        .filter((item): item is NavItem => item !== null);
}

/**
 * يحوّل groups القادمة من الـAPI (`{ title, items }`) إلى NavGroup[] للـSidebar.
 *
 * يزيل المجموعات الفارغة (بدون عنوان وبدون عناصر).
 */
export function menuGroupsToNavGroups(
    groups: MenuBuilderMenuGroup[],
    resolveIcon: IconResolver,
): NavGroup[] {
    return groups
        .map((group) => {
            return {
                title: group.title,
                items: menuItemsToNavItems(group.items ?? [], resolveIcon),
            };
        })
        .filter((group) => group.title !== '' || group.items.length > 0);
}
