<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AppearanceController extends Controller
{
    protected ?string $inertiaModuleConfigKey = 'settings.name';

    protected ?string $inertiaModuleFallbackName = '';

    /** @var array<string>|string */
    protected array|string $inertiaTranslationGroups = ['appearance', 'settings'];

    public function index()
    {
        return inertia('settings/appearance');
    }
}
