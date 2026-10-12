import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    namespace?: string;
};

export type NavItem = {
    id?: string | number;
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | string | null;
    namespace?: string;
    isActive?: boolean;
    disabled?: boolean;
    items?: NavItem[];
};

export interface NavGroup {
    title: string;
    items: NavItem[];
}
