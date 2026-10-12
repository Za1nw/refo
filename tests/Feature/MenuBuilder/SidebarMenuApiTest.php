<?php

use App\Models\User;
use Modules\MenuBuilder\Models\MenuItem;

test('sidebar menu is returned from api endpoint', function () {
    $user = User::factory()->create();

    MenuItem::query()->create([
        'scope' => 'admin_sidebar',
        'type' => 'link',
        'title' => 'Dashboard',
        'icon' => 'LayoutGrid',
        'is_route' => false,
        'url' => '/dashboard',
        'active_patterns' => ['dashboard'],
        'parent_id' => null,
        'sort' => 0,
        'status' => true,
        'is_disabled' => false,
    ]);

    $this->actingAs($user)
        ->get('/api/v1/sidebar-menu')
        ->assertOk()
        ->assertJsonPath('main.0.title', 'Platform')
        ->assertJsonPath('main.0.items.0.title', 'Dashboard')
        ->assertJsonPath('main.0.items.0.href', '/dashboard');
});
