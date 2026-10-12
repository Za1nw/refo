<?php

use App\Models\User;
use Modules\MenuBuilder\Models\MenuItem;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

it('hides the whole parent when parent permission is missing', function () {
    $viewShop = Permission::firstOrCreate(['name' => 'view_shop', 'guard_name' => 'web']);
    $viewBlog = Permission::firstOrCreate(['name' => 'view_blog', 'guard_name' => 'web']);

    $shop = MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'group',
        'title' => 'Shop',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => null,
        'active_patterns' => null,
        'parent_id' => null,
        'sort' => 0,
        'status' => true,
        'is_disabled' => false,
    ]);

    $shop->permissions()->sync([$viewShop->id]);

    $blogs = MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'dropdown',
        'title' => 'Blogs',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => null,
        'active_patterns' => null,
        'parent_id' => $shop->id,
        'sort' => 1,
        'status' => true,
        'is_disabled' => false,
    ]);

    $blogs->permissions()->sync([$viewShop->id, $viewBlog->id]);

    MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'link',
        'title' => 'Blogs List',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => '/blogs',
        'active_patterns' => null,
        'parent_id' => $blogs->id,
        'sort' => 1,
        'status' => true,
        'is_disabled' => false,
    ]);

    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    $user->givePermissionTo('view_blog');

    $this->actingAs($user);

    $menus = app()->makeWith(\Modules\MenuBuilder\Interfaces\Action\MenuBuilderList::class, [
        'scope' => 'admin_sidebar',
    ])->handle();

    expect($menus->resource)->toHaveCount(0);
});

it('requires all permissions and filters children correctly', function () {
    $viewShop = Permission::firstOrCreate(['name' => 'view_shop', 'guard_name' => 'web']);
    $viewBlog = Permission::firstOrCreate(['name' => 'view_blog', 'guard_name' => 'web']);
    $viewBlogCategories = Permission::firstOrCreate(['name' => 'view_blog_categories', 'guard_name' => 'web']);

    $shop = MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'group',
        'title' => 'Shop',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => null,
        'active_patterns' => null,
        'parent_id' => null,
        'sort' => 0,
        'status' => true,
        'is_disabled' => false,
    ]);

    $shop->permissions()->sync([$viewShop->id]);

    $blogs = MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'dropdown',
        'title' => 'Blogs',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => null,
        'active_patterns' => null,
        'parent_id' => $shop->id,
        'sort' => 1,
        'status' => true,
        'is_disabled' => false,
    ]);

    $blogs->permissions()->sync([$viewShop->id, $viewBlog->id]);

    $blogsList = MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'link',
        'title' => 'Blogs List',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => '/blogs',
        'active_patterns' => null,
        'parent_id' => $blogs->id,
        'sort' => 1,
        'status' => true,
        'is_disabled' => false,
    ]);

    $blogsList->permissions()->sync([$viewShop->id, $viewBlog->id]);

    $categories = MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'link',
        'title' => 'Categories',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => '/blog/categories',
        'active_patterns' => null,
        'parent_id' => $blogs->id,
        'sort' => 2,
        'status' => true,
        'is_disabled' => false,
    ]);

    $categories->permissions()->sync([$viewShop->id, $viewBlogCategories->id]);

    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    $user->givePermissionTo('view_shop');
    $user->givePermissionTo('view_blog');

    $this->actingAs($user);

    $menus = app()->makeWith(\Modules\MenuBuilder\Interfaces\Action\MenuBuilderList::class, [
        'scope' => 'admin_sidebar',
    ])->handle();

    expect($menus->resource)->toHaveCount(1);

    $shopNode = $menus->resource->first();
    expect($shopNode->title)->toBe('Shop');
    expect($shopNode->children)->toHaveCount(1);

    $blogsNode = $shopNode->children->first();
    expect($blogsNode->title)->toBe('Blogs');
    expect($blogsNode->children)->toHaveCount(1);
    expect($blogsNode->children->first()->title)->toBe('Blogs List');
});

it('hides a dropdown (and its children) when a required permission is missing', function () {
    $viewShop = Permission::firstOrCreate(['name' => 'view_shop', 'guard_name' => 'web']);
    $viewBlog = Permission::firstOrCreate(['name' => 'view_blog', 'guard_name' => 'web']);

    $shop = MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'group',
        'title' => 'Shop',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => null,
        'active_patterns' => null,
        'parent_id' => null,
        'sort' => 0,
        'status' => true,
        'is_disabled' => false,
    ]);

    $shop->permissions()->sync([$viewShop->id]);

    $blogs = MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'dropdown',
        'title' => 'Blogs',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => null,
        'active_patterns' => null,
        'parent_id' => $shop->id,
        'sort' => 1,
        'status' => true,
        'is_disabled' => false,
    ]);

    $blogs->permissions()->sync([$viewShop->id, $viewBlog->id]);

    MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'link',
        'title' => 'Blogs List',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => '/blogs',
        'active_patterns' => null,
        'parent_id' => $blogs->id,
        'sort' => 1,
        'status' => true,
        'is_disabled' => false,
    ]);

    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    $user->givePermissionTo('view_shop');

    $this->actingAs($user);

    $menus = app()->makeWith(\Modules\MenuBuilder\Interfaces\Action\MenuBuilderList::class, [
        'scope' => 'admin_sidebar',
    ])->handle();

    expect($menus->resource)->toHaveCount(0);
});
