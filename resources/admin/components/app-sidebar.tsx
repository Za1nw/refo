import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import {
    fetchSidebarMenu,
    selectSidebarMenu,
    selectSidebarMenuError,
    selectSidebarMenuLoading,
} from '@/slices/sidebarMenuSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { resolveLucideIcon } from '@menubuilder/lib/lucide-icons';
import {
    menuGroupsToNavGroups,
    menuItemsToNavItems,
    onSidebarMenuInvalidated,
} from '@menubuilder/lib/sidebar-menu';

import AppLogo from './app-logo';
import { NavFooter } from './nav-footer';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { useDirection } from '@/components/ui/direction';


export function AppSidebar() {
    const dispatch = useAppDispatch();
    const menu = useAppSelector(selectSidebarMenu);
    const direction = useDirection();
    const isLoading = useAppSelector(selectSidebarMenuLoading);
    const error = useAppSelector(selectSidebarMenuError);
    const { t } = useTranslation('main');

    // Read menu style from localStorage and listen for live changes
    const storageKey = 'ui:menuStyle'
    const readStored = (): 'sidebar' | 'floating' | 'inset' => {
        try {
            const v = window.__menuStyle
            if (v === 'sidebar' || v === 'floating' || v === 'inset') return v
        } catch {}
        return 'inset'
    }

    const [variant, setVariant] = useState<'sidebar' | 'floating' | 'inset'>(readStored)

    useEffect(() => {
        const handler = (e: Event) => {
            try {
                const detail = (e as CustomEvent).detail as string | undefined
                if (detail === 'sidebar' || detail === 'floating' || detail === 'inset') {
                    setVariant(detail)
                    return
                }
            } catch {}
            // fallback: read from storage
            setVariant(readStored())
        }

        const storageHandler = (e: StorageEvent) => {
            if (e.key === storageKey) {
                const v = (e.newValue as string) || 'inset'
                if (v === 'sidebar' || v === 'floating' || v === 'inset') setVariant(v)
            }
        }

        window.addEventListener('ui:menuStyleChange', handler as EventListener)
        window.addEventListener('storage', storageHandler)

        return () => {
            window.removeEventListener('ui:menuStyleChange', handler as EventListener)
            window.removeEventListener('storage', storageHandler)
        }
    }, [])

    useEffect(() => {
        void dispatch(fetchSidebarMenu());

        const unsubscribe = onSidebarMenuInvalidated(() => {
            void dispatch(fetchSidebarMenu({ force: true }));
        });

        return unsubscribe;
    }, []);

    const mainNavGroups: NavGroup[] = useMemo(
        () => menuGroupsToNavGroups(menu.main ?? [], resolveLucideIcon),
        [menu.main],
    );

    const footerNavItems: NavItem[] = useMemo(
        () => menuItemsToNavItems(menu.footer ?? [], resolveLucideIcon),
        [menu.footer],
    );

    return (
        <Sidebar side={direction == "rtl" ? "right" : "left"} collapsible="icon" variant={variant}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className='scrollbar not-hover:overflow-hidden'>
                {isLoading ? (
                    <div className="px-2 py-2">
                        <SidebarMenuSkeleton showIcon />
                        <SidebarMenuSkeleton showIcon />
                        <SidebarMenuSkeleton showIcon />
                    </div>
                ) : error ? (
                    <div className="px-2 py-2">
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                            {t('Failed to load menu.')}
                        </div>
                        <button
                            type="button"
                            className="mt-2 text-sm underline"
                            onClick={() => void dispatch(fetchSidebarMenu({ force: true }))}
                        >
                            {t('Retry')}
                        </button>
                    </div>
                ) : (
                    <NavMain groups={mainNavGroups} />
                )}
            </SidebarContent>

            <SidebarFooter>
                {isLoading ? (
                    <div className="px-2 py-2">
                        <SidebarMenuSkeleton showIcon />
                        <SidebarMenuSkeleton showIcon />
                    </div>
                ) : (
                    <NavFooter items={footerNavItems} className="mt-auto" />
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
