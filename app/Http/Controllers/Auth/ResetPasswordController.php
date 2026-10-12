<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResetPasswordController extends Controller
{
    protected ?string $inertiaModuleConfigKey = 'settings.name';

    protected ?string $inertiaModuleFallbackName = '';

    /** @var array<string>|string */
    protected array|string $inertiaTranslationGroups = ['auth'];

    public function create(Request $request)
    {
        return Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }
}
