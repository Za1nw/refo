<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Modules\MenuBuilder\Models\MenuItem;

it('returns menus json from api index using MenuItemResponse', function () {
    $this->actingAs(User::factory()->create(), 'sanctum');

    MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'link',
        'title' => 'Dashboard',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => '/dashboard',
        'active_patterns' => ['dashboard'],
        'parent_id' => null,
        'sort' => 0,
        'status' => true,
        'is_disabled' => false,
    ]);

    $this->getJson('/api/v1/menubuilders?scope=admin_sidebar')
        ->assertOk()
        ->assertJsonStructure([
            'menus' => [
                ['id', 'type', 'title', 'icon', 'href', 'is_route', 'route_name', 'active', 'active_patterns', 'disabled', 'status', 'children'],
            ],
        ]);
});

it('invalidates menu cache when items change', function () {
    app()->detectEnvironment(fn () => 'production');

    $user = User::factory()->create();
    $this->actingAs($user);

    Cache::flush();

    $first = app()->makeWith(\Modules\MenuBuilder\Interfaces\Action\MenuBuilderList::class, ['scope' => 'admin_sidebar'])->handle();

    expect($first->resource)->toHaveCount(0);

    MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'link',
        'title' => 'A',
        'short_title' => null,
        'icon' => null,
        'is_route' => false,
        'route_name' => null,
        'url' => '/a',
        'active_patterns' => null,
        'parent_id' => null,
        'sort' => 0,
        'status' => true,
        'is_disabled' => false,
    ]);

    $second = app()->makeWith(\Modules\MenuBuilder\Interfaces\Action\MenuBuilderList::class, ['scope' => 'admin_sidebar'])->handle();

    expect($second->resource)->toHaveCount(1);
});
