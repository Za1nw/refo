<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;
use Inertia\Response;
use Modules\Settings\Models\Setting;
use Spatie\Permission\Middleware\PermissionMiddleware;

class SettingsController extends Controller implements HasMiddleware
{
    public const KNOWN_KEYS = [
        'whatsapp_number',
        'contact_number',
        'whatsapp_link',
        'telegram_link',
        'twitter_link',
        'facebook_link',
        'instagram_link',
        'admin_notification_emails',
        'primary_color',
        'secondary_color',
        'menuStyle',
        'radius',
    ];

    public static function middleware(): array
    {
        return [
            new Middleware(PermissionMiddleware::class.':view_setting', only: ['index', 'show']),
            new Middleware(PermissionMiddleware::class.':add_setting', only: ['create', 'store']),
            new Middleware(PermissionMiddleware::class.':edit_setting', only: ['edit', 'update']),
            new Middleware(PermissionMiddleware::class.':delete_setting', only: ['destroy']),
        ];
    }

    protected ?string $inertiaModuleConfigKey = 'settings.name';

    protected ?string $inertiaModuleFallbackName = 'Settings';

    protected array|string|null $inertiaTranslationNamespaces = 'settings';

    /**
     * عرض شاشة الإعدادات المحددة.
     *
     * @param  string  $screen  اسم شاشة الإعدادات
     * @return Response
     */
    public function index(string $screen = 'general')
    {
        $allowed = ['general', 'customization'];

        if (! in_array($screen, $allowed)) {
            abort(404);
        }

        $allSettings = Setting::query()->pluck('val', 'name')->toArray();

        return inertia('Settings::settings', [
            'screen' => $screen,
            'settings' => $allSettings,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('settings::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => ['required', 'string', Rule::in(self::KNOWN_KEYS)],
            'settings.*.value' => 'nullable|string',
            'settings.*.type' => 'nullable|string|in:string,number,boolean,color,json',
        ]);

        $settings = $request->input('settings', []);
        foreach ($settings as $settingItem) {
            $key = $settingItem['key'];
            $value = $settingItem['value'] ?? null;
            $type = $settingItem['type'] ?? 'string';

            Setting::set($key, $value, $type);
        }

        return redirect()->back()->with('success', __('Settings updated successfully.'));
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('settings::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('settings::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
