<?php

return [


    'USER_PERMISSION_ALLOW' => [
        'view_dashboard',
    ],
    'MODULES' => [
        [
            'module_name' => 'Blog',
            'is_custom_permission' => 0,
        ],
        [
            'module_name' => 'Blog Categories',
            'is_custom_permission' => 0,
        ],
        [
            'module_name' => 'Blog Tags',
            'is_custom_permission' => 0,
        ],

        [
            'module_name' => 'Auth',
            'more_permission' => ['role', 'permission'],
            'is_custom_permission' => 0,
        ],

        [
            'module_name' => 'Menu Builder',
            'more_permission' => ['sidebar', 'header'],
            'is_custom_permission' => 0,
        ],
        [
            'module_name' => 'Setting',
            'more_permission' => ['general', 'misc', 'quick_booking', 'custom_code', 'customization', 'mail', 'notification', 'intigrations', 'custom_fields', 'currency', 'commission', 'holiday', 'bussiness_hours', 'payment_method', 'language', 'menu_builder', 'invoice'],
            'is_custom_permission' => 1,
        ],
        // صلاحية تعديل على المستخدمين admin حق نظام وليس العملاء اريد اسم مختلف عن users
        [
            'module_name' => 'Admin Users',
            'is_custom_permission' => 0,
        ],
        [
            'module_name' => 'Language',
            'is_custom_permission' => 0,
        ],

    ],
];
