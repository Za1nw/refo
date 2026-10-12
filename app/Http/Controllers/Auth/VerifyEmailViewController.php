<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerifyEmailViewController extends Controller
{
    protected ?string $inertiaModuleConfigKey = 'settings.name';

    protected ?string $inertiaModuleFallbackName = '';

    /** @var array<string>|string */
    protected array|string $inertiaTranslationGroups = ['auth'];

    public function create(Request $request)
    {
        return Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]);
    }
}
