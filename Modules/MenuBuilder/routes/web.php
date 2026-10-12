<?php

use Illuminate\Support\Facades\Route;
use Modules\MenuBuilder\Http\Controllers\MenuBuilderController;

Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('api/v1/sidebar-menu', [MenuBuilderController::class, 'index'])->name('api.sidebar-menu');
    // Route::resource('menubuilders', MenuBuilderController::class)->names('menubuilder');
});
