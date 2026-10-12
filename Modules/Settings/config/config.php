<?php

return [
    'name' => 'Settings',

    /*
    |--------------------------------------------------------------------------
    | القيم الافتراضية لإعدادات التواصل والشبكات الاجتماعية وإشعارات الإدارة
    |--------------------------------------------------------------------------
    */
    'defaults' => [
        'whatsapp_number' => env('WHATSAPP_NUMBER', '967777855956'),
        'contact_number' => env('CONTACT_NUMBER', '+967 777 855 956'),
        'whatsapp_link' => env('WHATSAPP_LINK', 'https://wa.me/967777855956'),
        'telegram_link' => env('TELEGRAM_LINK'),
        'twitter_link' => env('TWITTER_LINK'),
        'facebook_link' => env('FACEBOOK_LINK'),
        'instagram_link' => env('INSTAGRAM_LINK'),
        'admin_notification_emails' => env('ADMIN_NOTIFICATION_EMAILS', 'fursaty@fursatyeducation.com'),
    ],

    'main' => [
        /*
        |--------------------------------------------------------------------------
        | مثال: Group (تقسيم القائمة: Shop / Reports / ...)
        |--------------------------------------------------------------------------
        |
        | الفكرة: عنصر type = group (أو header) ويكون تحته children.
        | ملاحظة: هذا مثال توضيحي فقط.
        */
        [
            'type' => 'group',
            'title' => 'System',
            'icon' => null,
            'children' => [
                [
                    'type' => 'link',
                    'title' => 'Settings',
                    'icon' => 'Settings2',
                    'is_route' => true,
                    'route_name' => 'settings.index',
                    'url' => null,
                    'active_patterns' => ['settings*'],
                    'permission' => ['view_setting'],
                ],
            ],
        ],

    ],
];
