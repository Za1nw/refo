<?php

return [
    'name' => 'MenuBuilder',
    /*
    |--------------------------------------------------------------------------
    | Main Sidebar Navigation
    |--------------------------------------------------------------------------
    */

    'main' => [

        [
            'title' => 'Dashboard',
            'icon' => 'LayoutGrid',
            'is_route' => true,
            'route_name' => 'dashboard',
            'url' => null,
            'active_patterns' => ['dashboard*'],
            'permission' => ['view_dashboard'],
        ],
        /*
        |--------------------------------------------------------------------------
        | مثال: Group (تقسيم القائمة: Shop / Reports / ...)
        |--------------------------------------------------------------------------
        |
        | الفكرة: عنصر type = group (أو header) ويكون تحته children.
        | ملاحظة: هذا مثال توضيحي فقط.
        */
        // [
        //     'type' => 'group',
        //     'title' => 'Shop',
        //     'icon' => null,
        //     'children' => [
        //         [
        //             'type' => 'link',
        //             'title' => 'Orders',
        //             'icon' => 'Folder',
        //             'is_route' => true,
        //             'route_name' => 'orders.index',
        //             'url' => null,
        //             'active_patterns' => ['orders*'],
        //             'permission' => ['view_orders'],
        //         ],
        //         [
        //             'type' => 'link',
        //             'title' => 'Products',
        //             'icon' => 'Folder',
        //             'is_route' => true,
        //             'route_name' => 'products.index',
        //             'url' => null,
        //             'active_patterns' => ['products*'],
        //             'permission' => ['view_products'],
        //         ],
        //     ],
        // ],

        /*
        |--------------------------------------------------------------------------
        | مثال: Dropdown (عنصر + عناصر فرعية)
        |--------------------------------------------------------------------------
        |
        | الفكرة: عنصر link وله children -> يظهر SubMenu (Dropdown).
        | ملاحظة: هذا مثال توضيحي فقط.
        */
        // [
        //     'type' => 'link',
        //     'title' => 'Reports',
        //     'icon' => 'Folder',
        //     'is_route' => true,
        //     'route_name' => 'reports.index',
        //     'url' => null,
        //     'active_patterns' => ['reports*'],
        //     'permission' => ['view_reports'],
        //     'children' => [
        //         [
        //             'type' => 'link',
        //             'title' => 'Sales',
        //             'icon' => null,
        //             'is_route' => true,
        //             'route_name' => 'reports.sales',
        //             'url' => null,
        //             'active_patterns' => ['reports/sales*'],
        //             'permission' => ['view_reports_sales'],
        //         ],
        //         [
        //             'type' => 'link',
        //             'title' => 'Inventory',
        //             'icon' => null,
        //             'is_route' => true,
        //             'route_name' => 'reports.inventory',
        //             'url' => null,
        //             'active_patterns' => ['reports/inventory*'],
        //             'permission' => ['view_reports_inventory'],
        //         ],
        //     ],
        // ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Footer Navigation
    |--------------------------------------------------------------------------
    */

    'footer' => [

        [
            'title' => 'Repository',
            'icon' => 'Folder',
            'is_route' => false,
            'route_name' => null,
            'url' => 'https://github.com/laravel/react-starter-kit',
            'active_patterns' => null,
            'permission' => ['view_repository'],
        ],

        [
            'title' => 'Documentation',
            'icon' => 'BookOpen',
            'is_route' => false,
            'route_name' => null,
            'url' => 'https://laravel.com/docs/starter-kits#react',
            'active_patterns' => null,
            'permission' => ['view_documentation'],
        ],

    ],
];
