<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Blog\Models\Blog;
use Modules\Blog\Models\BlogCategory;
use Modules\Blog\Models\BlogTag;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $permissions = [
        'view_blog',
        'add_blog',
        'edit_blog',
        'delete_blog',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }
});

test('authorized users can view blogs list', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view_blog');

    $response = $this->actingAs($user)->get(route('blog.index'));

    $response->assertOk();
});

test('blogs list filters by status and category', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view_blog');

    $category = BlogCategory::create([
        'name' => 'Tech',
        'is_active' => true,
    ]);

    $blog1 = Blog::factory()->create([
        'category_id' => $category->id,
        'is_active' => true,
    ]);
    $blog1->setTranslations(['title' => 'First Post', 'description' => 'Excerpt 1', 'content' => '<p>Content 1</p>'], 'ar');

    $blog2 = Blog::factory()->create([
        'is_active' => false,
    ]);
    $blog2->setTranslations(['title' => 'Second Post', 'description' => 'Excerpt 2', 'content' => '<p>Content 2</p>'], 'ar');

    $response = $this->actingAs($user)->get(route('blog.index', [
        'category_id' => $category->id,
        'status' => 'active',
    ]));

    $response->assertOk();
});

test('authorized users can create and update a blog category', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('add_blog', 'edit_blog');

    $category = BlogCategory::create([
        'name' => 'Design',
        'is_active' => true,
    ]);

    expect($category->name)->toBe('Design');
    expect($category->is_active)->toBeTrue();

    $category->update(['name' => 'UI/UX Design']);
    expect($category->fresh()->name)->toBe('UI/UX Design');
});

test('authorized users can create and update a blog tag', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('add_blog', 'edit_blog');

    $tag = BlogTag::create([
        'name' => 'Laravel',
        'is_active' => true,
    ]);

    expect($tag->name)->toBe('Laravel');
    expect($tag->is_active)->toBeTrue();

    $tag->update(['name' => 'Laravel 11']);
    expect($tag->fresh()->name)->toBe('Laravel 11');
});
