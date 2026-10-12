<?php

return [
    'name' => 'Blog',
    'main' => [
        [
            'type' => 'dropdown',
            'title' => 'Blogs',
            'icon' => 'NewspaperIcon',
            'active_patterns' => ['blogs*'],
            'permission' => ['view_blog', 'view_shop'],
            'children' => [
                [
                    'title' => 'Blogs List',
                    'icon' => 'NewspaperIcon',
                    'is_route' => true,
                    'route_name' => 'blog.index',
                    'url' => null,
                    'active_patterns' => ['blogs*'],
                    'permission' => ['view_blog', 'view_shop'],
                ],
                [
                    'title' => 'Categories',
                    'icon' => 'Folder',
                    'is_route' => true,
                    'route_name' => 'blog.categories.index',
                    'url' => null,
                    'active_patterns' => ['blogs/categories*'],
                    'permission' => ['view_blog_categories', 'view_shop'],
                ],
                [
                    'title' => 'Tags',
                    'icon' => 'Folder',
                    'is_route' => true,
                    'route_name' => 'blog.tags.index',
                    'url' => null,
                    'active_patterns' => ['blogs/tags*'],
                    'permission' => ['view_blog_tags', 'view_shop'],
                ],

            ],
        ],
    ],
];
