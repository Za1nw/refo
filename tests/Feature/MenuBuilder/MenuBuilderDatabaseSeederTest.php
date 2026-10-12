<?php

use Modules\MenuBuilder\Database\Seeders\MenuBuilderDatabaseSeeder;
use Modules\MenuBuilder\Models\MenuItem;

test('menu builder seeder handles group and dropdown defaults', function () {
    config([
        'menubuilder.main' => [
            [
                'title' => 'Shop',
                'children' => [
                    [
                        'title' => 'Orders',
                        'route_name' => 'orders.index',
                        'active_patterns' => ['orders*'],
                    ],
                ],
            ],
            [
                'title' => 'Reports',
                'route_name' => 'reports.index',
                'active_patterns' => ['reports*'],
                'children' => [
                    [
                        'title' => 'Sales',
                        'route_name' => 'reports.sales',
                        'active_patterns' => ['reports/sales*'],
                    ],
                ],
            ],
            [
                'type' => 'dropdown',
                'title' => 'Blog',
                'children' => [
                    [
                        'title' => 'Blog List',
                        'route_name' => 'blog.index',
                        'active_patterns' => ['blogs*'],
                    ],
                ],
            ],
        ],
        'menubuilder.footer' => [],
    ]);

    (new MenuBuilderDatabaseSeeder)->run();

    $shop = MenuItem::query()
        ->where('scope', 'admin_sidebar')
        ->whereNull('parent_id')
        ->where('title', 'Shop')
        ->firstOrFail();

    expect($shop->type)->toBe('group');
    expect($shop->is_route)->toBeFalse();

    $orders = MenuItem::query()
        ->where('parent_id', $shop->id)
        ->where('title', 'Orders')
        ->firstOrFail();

    expect($orders->type)->toBe('link');
    expect($orders->is_route)->toBeTrue();

    $reports = MenuItem::query()
        ->where('scope', 'admin_sidebar')
        ->whereNull('parent_id')
        ->where('title', 'Reports')
        ->firstOrFail();

    expect($reports->type)->toBe('link');
    expect($reports->is_route)->toBeTrue();

    $blog = MenuItem::query()
        ->where('scope', 'admin_sidebar')
        ->whereNull('parent_id')
        ->where('title', 'Blog')
        ->firstOrFail();

    expect($blog->type)->toBe('dropdown');
    expect($blog->is_route)->toBeFalse();
});
