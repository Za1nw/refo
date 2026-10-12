<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\SettingsController;

$endpointUrl = config('app.endpoint_url', 'admin/hidden/');
Route::prefix($endpointUrl)->middleware(['auth', 'verified'])->group(function () {
    Route::get('platform/settings/{screen?}', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('platform/settings', [SettingsController::class, 'store'])->name('settings.store');
});
