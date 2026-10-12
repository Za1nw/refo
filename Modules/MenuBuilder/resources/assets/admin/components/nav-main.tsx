
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { selectSidebarMenuOpenByKey, setOpen, toggleOpen } from '@/slices/sidebarMenuSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo } from 'react';

/**
 * يتحقق هل العنصر الحالي (أو أي عنصر داخله) هو الرابط الحالي.
 * نستخدم هذا لتحديد الـactive ولتحديد هل نفتح الـdropdown تلقائيًا.
 */
function isItemTreeActive(item: NavItem, urlIsActive: (href: NavItem['href']) => boolean): boolean {
    if (urlIsActive(item.href)) {
        return true;
    }

    return (item.items ?? []).some((child) => isItemTreeActive(child, urlIsActive));
}

function buildNodeKey(item: NavItem, fallbackIndex: number): string {
    return String(item.id ?? `${fallbackIndex}-${item.href}-${item.title}`);
}

function NavNode({
    item,
    nodeKey,
    depth,
    urlIsActive,
}: {
    item: NavItem;
    nodeKey: string;
    depth: number;
    urlIsActive: (href: NavItem['href']) => boolean;
}) {
    const dispatch = useAppDispatch();
    const openByKey = useAppSelector(selectSidebarMenuOpenByKey);

    const hasChildren = Boolean(item.items && item.items.length > 0);
    const isActive = useMemo(() => isItemTreeActive(item, urlIsActive), [item, urlIsActive]);

    const open = openByKey[nodeKey] ?? isActive;

    useEffect(() => {
        if (isActive && openByKey[nodeKey] !== true) {
            dispatch(setOpen({ key: nodeKey, open: true }));
        }
    }, [dispatch, isActive, nodeKey, openByKey]);

    const buttonChevronClass =
        'data-[state=open]:[&>svg:last-child]:rotate-180 [&>svg:last-child]:transition-transform';

    if (depth === 0) {
        return (
            <SidebarMenuItem>
                {hasChildren ? (
                    <>
                        <SidebarMenuButton
                            type="button"
                            isActive={isActive}
                            tooltip={{ children: item.title }}
                            onClick={() => {
                                if (item.disabled) {
                                    return;
                                }

                                dispatch(toggleOpen({ key: nodeKey }));
                            }}
                            data-state={open ? 'open' : 'closed'}
                            className={buttonChevronClass}
                            disabled={item.disabled}
                        >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronDown className="ms-auto" />
                        </SidebarMenuButton>

                        {open ? (
                            <SidebarMenuSub>
                                {item.items?.map((child, childIndex) => (
                                    <NavNode
                                        key={String(child.id ?? `${nodeKey}/${buildNodeKey(child, childIndex)}`)}
                                        item={child}
                                        nodeKey={`${nodeKey}/${buildNodeKey(child, childIndex)}`}
                                        depth={depth + 1}
                                        urlIsActive={urlIsActive}
                                    />
                                ))}
                            </SidebarMenuSub>
                        ) : null}
                    </>
                ) : (
                    item.disabled ? (
                        <SidebarMenuButton
                            type="button"
                            disabled
                            tooltip={{ children: item.title }}
                        >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </SidebarMenuButton>
                    ) : (
                        <SidebarMenuButton
                            asChild
                            isActive={urlIsActive(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    )
                )}
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuSubItem>
            {hasChildren ? (
                <>
                    <SidebarMenuSubButton
                        asChild
                        isActive={isActive}
                        data-state={open ? 'open' : 'closed'}
                        className={buttonChevronClass}
                    >
                        <button
                            type="button"
                            disabled={item.disabled}
                            onClick={() => {
                                if (item.disabled) {
                                    return;
                                }

                                dispatch(toggleOpen({ key: nodeKey }));
                            }}
                        >
                            <span>{item.title}</span>
                            <ChevronDown className="ms-auto" />
                        </button>
                    </SidebarMenuSubButton>

                    {open ? (
                        <SidebarMenuSub>
                            {item.items?.map((child, childIndex) => (
                                <NavNode
                                    key={String(child.id ?? `${nodeKey}/${buildNodeKey(child, childIndex)}`)}
                                    item={child}
                                    nodeKey={`${nodeKey}/${buildNodeKey(child, childIndex)}`}
                                    depth={depth + 1}
                                    urlIsActive={urlIsActive}
                                />
                            ))}
                        </SidebarMenuSub>
                    ) : null}
                </>
            ) : (
                item.disabled ? (
                    <SidebarMenuSubButton asChild aria-disabled>
                        <button type="button" disabled>
                            <span>{item.title}</span>
                        </button>
                    </SidebarMenuSubButton>
                ) : (
                    <SidebarMenuSubButton asChild isActive={urlIsActive(item.href)}>
                        <Link href={item.href} prefetch>
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuSubButton>
                )
            )}
        </SidebarMenuSubItem>
    );
}

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const { urlIsActive } = useActiveUrl();

    return (
        <>
            {groups.map((group, groupIndex) => (
                <SidebarGroup key={`${group.title}-${groupIndex}`} className="px-2 py-0">
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item, itemIndex) => (
                            <NavNode
                                key={String(item.id ?? `${groupIndex}-${buildNodeKey(item, itemIndex)}`)}
                                item={item}
                                nodeKey={`${groupIndex}/${buildNodeKey(item, itemIndex)}`}
                                depth={0}
                                urlIsActive={urlIsActive}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
