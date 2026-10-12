<?php

use Illuminate\Support\Facades\Route;

Route::get('/custom-api', function () {
    return 'This is a custom API route.';
})->name('custom.api');
