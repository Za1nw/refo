<?php

namespace Modules\Settings\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Settings\Models\Setting;

class SettingsTableSeeder extends Seeder
{
    /**
     * تشغيل بذور قاعدة البيانات لحفظ الإعدادات الافتراضية من متغيرات البيئة.
     */
    public function run(): void
    {
        $rawAdminEmails = config('settings.defaults.admin_notification_emails', env('ADMIN_NOTIFICATION_EMAILS', 'fursaty@fursatyeducation.com'));
        $adminEmailsList = [];

        if (is_array($rawAdminEmails)) {
            $adminEmailsList = $rawAdminEmails;
        } elseif (is_string($rawAdminEmails) && trim($rawAdminEmails) !== '') {
            $adminEmailsList = array_values(array_filter(array_map('trim', explode(',', $rawAdminEmails))));
        }

        $defaultSettings = [
            [
                'key' => 'whatsapp_number',
                'val' => config('settings.defaults.whatsapp_number', env('WHATSAPP_NUMBER', '967777855956')),
                'type' => 'string',
            ],
            [
                'key' => 'contact_number',
                'val' => config('settings.defaults.contact_number', env('CONTACT_NUMBER', '+967 777 855 956')),
                'type' => 'string',
            ],
            [
                'key' => 'whatsapp_link',
                'val' => config('settings.defaults.whatsapp_link', env('WHATSAPP_LINK', 'https://wa.me/967777855956')),
                'type' => 'string',
            ],
            [
                'key' => 'telegram_link',
                'val' => config('settings.defaults.telegram_link', env('TELEGRAM_LINK')),
                'type' => 'string',
            ],
            [
                'key' => 'twitter_link',
                'val' => config('settings.defaults.twitter_link', env('TWITTER_LINK')),
                'type' => 'string',
            ],
            [
                'key' => 'facebook_link',
                'val' => config('settings.defaults.facebook_link', env('FACEBOOK_LINK')),
                'type' => 'string',
            ],
            [
                'key' => 'instagram_link',
                'val' => config('settings.defaults.instagram_link', env('INSTAGRAM_LINK')),
                'type' => 'string',
            ],
            [
                'key' => 'admin_notification_emails',
                'val' => ! empty($adminEmailsList) ? json_encode($adminEmailsList) : json_encode([]),
                'type' => 'json',
            ],
        ];

        foreach ($defaultSettings as $setting) {
            if (! Setting::has($setting['key'])) {
                Setting::set($setting['key'], $setting['val'], $setting['type']);
            }
        }
    }
}
