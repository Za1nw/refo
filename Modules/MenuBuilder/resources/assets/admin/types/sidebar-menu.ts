export type MenuBuilderMenuItem = {
    id?: number | string;
    title: string;
    href?: string | null;
    icon?: string | null;
    type?: string;
    disabled?: boolean;
    children?: MenuBuilderMenuItem[];
};

export type MenuBuilderMenuGroup = {
    title: string;
    items: MenuBuilderMenuItem[];
};

export type SidebarMenuResponse = {
    main: MenuBuilderMenuGroup[];
    footer: MenuBuilderMenuItem[];
};

