<?php

use Illuminate\Support\Facades\Route;
use Modules\Blog\Http\Controllers\BlogCategoryController;
use Modules\Blog\Http\Controllers\BlogController;
use Modules\Blog\Http\Controllers\BlogPageController;
use Modules\Blog\Http\Controllers\BlogTagController;

$endpointUrl = config('app.endpoint_url', 'admin/hidden/');

Route::prefix($endpointUrl)->middleware(['auth', 'verified'])->group(function () {
    Route::get('blogs/{blog}/translate', [BlogController::class, 'translate'])->name('blog.translate');
    Route::post('blogs/{blog}/translate', [BlogController::class, 'updateTranslation'])->name('blog.translate.update');
    // Blog category/tag quick API endpoints
    Route::get('blog-categories', [BlogCategoryController::class, 'index'])->name('blog.categories.index');
    Route::post('blog-categories', [BlogCategoryController::class, 'store'])->name('blog.categories.store');
    Route::get('blog-categories/{blogCategory}/translate', [BlogCategoryController::class, 'translate'])->name('blog.categories.translate');
    Route::post('blog-categories/{blogCategory}/translate', [BlogCategoryController::class, 'updateTranslation'])->name('blog.categories.translate.update');
    Route::put('blog-categories/{blogCategory}', [BlogCategoryController::class, 'update'])->name('blog.categories.update');
    Route::delete('blog-categories/{blogCategory}', [BlogCategoryController::class, 'destroy'])->name('blog.categories.destroy');
    Route::get('blog-tags', [BlogTagController::class, 'index'])->name('blog.tags.index');
    Route::post('blog-tags', [BlogTagController::class, 'store'])->name('blog.tags.store');
    Route::get('blog-tags/{blogTag}/translate', [BlogTagController::class, 'translate'])->name('blog.tags.translate');
    Route::post('blog-tags/{blogTag}/translate', [BlogTagController::class, 'updateTranslation'])->name('blog.tags.translate.update');
    Route::put('blog-tags/{blogTag}', [BlogTagController::class, 'update'])->name('blog.tags.update');
    Route::delete('blog-tags/{blogTag}', [BlogTagController::class, 'destroy'])->name('blog.tags.destroy');
    Route::resource('blogs', BlogController::class)->names('blog');
});

// Route::group(['prefix' => '{locale?}', 'where' => ['locale' => 'en|ar'], 'as' => 'locale.'], function () {
//     Route::get('/blogs', [BlogPageController::class, 'index'])->name('client.blogs');
//     Route::get('/blogs/{blog:slug}', [BlogPageController::class, 'show'])
//     ->name('client.blogs.show');
// });
// Route::get('/blogs', [BlogPageController::class, 'index'])->name('client.blogs');
// Route::get('/blogs/{blog:slug}', [BlogPageController::class, 'show'])
//     ->name('client.blogs.show');
