<?php

use Illuminate\Support\Facades\Route;
use Modules\Language\Http\Controllers\LanguageController;

$endpointUrl = config('app.endpoint_url', 'admin/hidden/');
Route::prefix($endpointUrl)->middleware(['auth', 'verified'])->group(function () {
    Route::get('languages', [LanguageController::class, 'index'])->name('languages.index');
    Route::get('languages/{namespace}/{group}', [LanguageController::class, 'edit'])->name('languages.edit');
    Route::patch('languages/{namespace}/{group}', [LanguageController::class, 'update'])->name('languages.update');
});
