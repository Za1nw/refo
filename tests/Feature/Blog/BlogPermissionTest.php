<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

function adminEndpoint(string $path): string
{
    $prefix = (string) config('app.endpoint_url', 'admin/hidden/');
    $prefix = trim($prefix, '/');

    return '/'.$prefix.'/'.ltrim($path, '/');
}

it('forbids blog index on web routes without view_blog permission', function () {
    Permission::firstOrCreate(['name' => 'view_blog', 'guard_name' => 'web']);

    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user);

    $this->get(adminEndpoint('blogs'))
        ->assertForbidden();
});

it('allows blog index on web routes with view_blog permission', function () {
    Permission::firstOrCreate(['name' => 'view_blog', 'guard_name' => 'web']);

    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $user->givePermissionTo('view_blog');

    $this->actingAs($user);

    $this->get(adminEndpoint('blogs'))
        ->assertOk();
});

it('forbids blog create on web routes without create_blog permission', function () {
    Permission::firstOrCreate(['name' => 'create_blog', 'guard_name' => 'web']);

    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user);

    $this->get(adminEndpoint('blogs/create'))
        ->assertForbidden();
});

it('forbids blog index on api routes without view_blog permission', function () {
    Permission::firstOrCreate(['name' => 'view_blog', 'guard_name' => 'web']);

    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum');

    $this->getJson('/api/v1/blogs')
        ->assertForbidden();
});

it('allows blog index on api routes with view_blog permission', function () {
    Permission::firstOrCreate(['name' => 'view_blog', 'guard_name' => 'web']);

    $user = User::factory()->create();

    $user->givePermissionTo('view_blog');

    $this->actingAs($user, 'sanctum');

    $this->getJson('/api/v1/blogs')
        ->assertOk();
});

it('forbids blog store on api routes without create_blog permission', function () {
    Permission::firstOrCreate(['name' => 'create_blog', 'guard_name' => 'web']);

    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum');

    $this->postJson('/api/v1/blogs', [])
        ->assertForbidden();
});
