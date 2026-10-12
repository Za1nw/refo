<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Settings\Database\Seeders\SettingsTableSeeder;
use Modules\Settings\Models\Setting;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
    config(['inertia.testing.ensure_pages_exist' => false]);

    $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web'], ['title' => 'Admin']);

    $permissions = [
        'view_setting',
        'add_setting',
        'edit_setting',
        'delete_setting',
    ];

    foreach ($permissions as $perm) {
        $p = Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        $role->givePermissionTo($p);
    }
});

test('unauthorized user cannot access settings page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('settings.index'));

    $response->assertForbidden();
});

test('admin with permission can view settings screen with existing values', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Setting::set('whatsapp_number', '+967777855956', 'string');
    Setting::set('telegram_link', 'https://t.me/fursaty', 'string');

    $response = $this->actingAs($admin)->get(route('settings.index', ['screen' => 'general']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Settings::settings')
        ->where('screen', 'general')
        ->has('settings.whatsapp_number')
        ->where('settings.whatsapp_number', '+967777855956')
        ->where('settings.telegram_link', 'https://t.me/fursaty')
    );
});

test('admin can store and update general settings including social links and notification emails', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $payload = [
        'settings' => [
            [
                'key' => 'whatsapp_number',
                'value' => '+967777855956',
                'type' => 'string',
            ],
            [
                'key' => 'contact_number',
                'value' => '+967777123456',
                'type' => 'string',
            ],
            [
                'key' => 'whatsapp_link',
                'value' => 'https://wa.me/967777855956',
                'type' => 'string',
            ],
            [
                'key' => 'telegram_link',
                'value' => 'https://t.me/fursaty_channel',
                'type' => 'string',
            ],
            [
                'key' => 'twitter_link',
                'value' => 'https://x.com/fursaty',
                'type' => 'string',
            ],
            [
                'key' => 'facebook_link',
                'value' => 'https://facebook.com/fursaty',
                'type' => 'string',
            ],
            [
                'key' => 'instagram_link',
                'value' => 'https://instagram.com/fursaty',
                'type' => 'string',
            ],
            [
                'key' => 'admin_notification_emails',
                'value' => json_encode(['supervisor@fursaty.com', 'admin@fursaty.com']),
                'type' => 'json',
            ],
        ],
    ];

    $response = $this->actingAs($admin)->post(route('settings.store'), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    expect(setting('whatsapp_number'))->toBe('+967777855956')
        ->and(setting('contact_number'))->toBe('+967777123456')
        ->and(setting('whatsapp_link'))->toBe('https://wa.me/967777855956')
        ->and(setting('telegram_link'))->toBe('https://t.me/fursaty_channel')
        ->and(setting('twitter_link'))->toBe('https://x.com/fursaty')
        ->and(setting('facebook_link'))->toBe('https://facebook.com/fursaty')
        ->and(setting('instagram_link'))->toBe('https://instagram.com/fursaty');

    $savedEmails = json_decode(setting('admin_notification_emails'), true);
    expect($savedEmails)->toBeArray()->toContain('supervisor@fursaty.com', 'admin@fursaty.com');
});

test('settings table seeder correctly seeds defaults into settings table', function () {
    $this->seed(SettingsTableSeeder::class);

    expect(setting('whatsapp_number'))->not()->toBeNull()
        ->and(setting('contact_number'))->not()->toBeNull()
        ->and(setting('whatsapp_link'))->not()->toBeNull()
        ->and(setting('admin_notification_emails'))->not()->toBeNull();

    $emails = json_decode(setting('admin_notification_emails'), true);
    expect($emails)->toBeArray();
});

test('store rejects unknown settings keys and invalid types', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $payload = [
        'settings' => [
            [
                'key' => 'unknown_malicious_key',
                'value' => 'hack',
                'type' => 'string',
            ],
            [
                'key' => 'whatsapp_number',
                'value' => '123',
                'type' => 'invalid_type',
            ],
        ],
    ];

    $response = $this->actingAs($admin)->post(route('settings.store'), $payload);

    $response->assertSessionHasErrors(['settings.0.key', 'settings.1.type']);
});

test('settings table seeder does not overwrite existing settings on reseed', function () {
    Setting::set('whatsapp_number', '+967111222333', 'string');

    $this->seed(SettingsTableSeeder::class);

    expect(setting('whatsapp_number'))->toBe('+967111222333');
});

test('homepage renders only non-empty social media links and removes obsolete contact channels and quick advice card', function () {
    Setting::set('whatsapp_number', '967777855956', 'string');
    Setting::set('whatsapp_link', 'https://wa.me/967777855956', 'string');
    Setting::set('telegram_link', 'https://t.me/fursaty_official', 'string');
    Setting::set('twitter_link', null, 'string');
    Setting::set('facebook_link', '', 'string');
    Setting::set('instagram_link', 'https://instagram.com/fursaty_edu', 'string');

    $response = $this->get(route('home'));

    $response->assertOk();

    // Verify configured links are present
    $response->assertSee('https://wa.me/967777855956');
    $response->assertSee('https://t.me/fursaty_official');
    $response->assertSee('https://instagram.com/fursaty_edu');

    // Verify removed elements are not rendered
    $response->assertDontSee('استشارة فورية وسريعة؟');
    $response->assertDontSee('info@fursaty.com');
    $response->assertDontSee('أوقات العمل الأكاديمي');
});
