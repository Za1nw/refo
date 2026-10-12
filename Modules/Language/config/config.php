<?php

return [
    'name' => 'Language',
    'main' => [

        [
            // ارقامنا
            'title' => 'Languages',
            'icon' => 'LanguagesIcon',
            'is_route' => true,
            'route_name' => 'languages.index',
            'url' => null,
            'active_patterns' => ['languages*'],
            'permission' => ['view_language'],
        ],
    ],

    // الملفات التي يمكن ترجمته من شاشة الترجمه حدد الملف واسم الملف او اسم صفحة التي يترجمه هذا الملف
    // مثال 'blog' => 'Blog' يعني كل النصوص الموجوده في resources/lang/{lang}/blog.php هذا الملف يترجمه في صفحه ترجمه اللغه تحت اسم Blog
    'translatable_files' => [
        ['group' => 'client_nav', 'label' => 'Client Navigation (القوائم والتنقل)', 'namespace' => 'default'],
        ['group' => 'client_home', 'label' => 'Home Page (الصفحة الرئيسية)', 'namespace' => 'default'],
        ['group' => 'client_scholarships', 'label' => 'Scholarships Directory (دليل وصفحة المنح)', 'namespace' => 'default'],
        ['group' => 'client_blogs', 'label' => 'Articles & Guides (دليل المقالات والأخبار)', 'namespace' => 'default'],
        ['group' => 'client_footer', 'label' => 'Client Footer (تذييل الموقع)', 'namespace' => 'default'],
    ],
];
