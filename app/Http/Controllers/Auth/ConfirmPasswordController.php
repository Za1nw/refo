<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ConfirmPasswordController extends Controller
{
    protected ?string $inertiaModuleConfigKey = 'settings.name';

    protected ?string $inertiaModuleFallbackName = '';

    /** @var array<string>|string */
    protected array|string $inertiaTranslationGroups = ['auth'];

    public function create()
    {
        return Inertia::render('auth/confirm-password');
    }
}
