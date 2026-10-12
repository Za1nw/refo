<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('blog module shares module name and translations', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('blog.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Blog::blog', false)
            ->where('module', config('blog.name', 'Blog'))
            ->has('translations')
        );
});

test('language module shares module name and translations', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('language.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Language::lang', false)
            ->where('module', config('language.name', 'Language'))
            ->has('translations')
        );
});
