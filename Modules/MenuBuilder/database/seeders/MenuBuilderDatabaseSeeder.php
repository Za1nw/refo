<?php

namespace Modules\MenuBuilder\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Modules\MenuBuilder\Models\MenuItem;
use Spatie\Permission\Models\Permission;

class MenuBuilderDatabaseSeeder extends Seeder
{
    public function __construct(
        protected $config = 'menubuilder'
    ) {}

    public function run(): void
    {
        DB::transaction(function () {

            // 1) اقرأ القوائم من config
            $nav = config($this->config, []);
            $main = $nav['main'] ?? [];
            $footer = $nav['footer'] ?? [];

            // 3) زرع main في scope = admin_sidebar
            $this->seedItems($main, 'admin_sidebar', null);

            // 4) زرع footer في scope = admin_footer
            $this->seedItems($footer, 'admin_footer', null);
        });

        // مهم مع Spatie لو ما ظهرت تغييرات الصلاحيات فورًا:
        // php artisan permission:cache-reset
    }

    /**
     * زرع عناصر القائمة (يدعم children).
     */
    private function seedItems(array $items, string $scope, ?int $parentId): void
    {
        $sort = 1;

        foreach ($items as $item) {
            $hasChildren = isset($item['children']) && ! empty($item['children']) && is_array($item['children']);

            $type = $item['type'] ?? ($hasChildren
                ? ((isset($item['route_name']) && $item['route_name'] !== null) || (isset($item['url']) && $item['url'] !== null) || array_key_exists('is_route', $item)
                    ? 'link'
                    : 'dropdown')
                : 'link');

            $isGroupLike = in_array($type, ['group', 'header', 'dropdown'], true);

            $isRoute = array_key_exists('is_route', $item)
                ? (bool) $item['is_route']
                : ! $isGroupLike;

            $title = $item['title'] ?? 'Untitled';
            $routeName = $item['route_name'] ?? null;
            $url = $item['url'] ?? null;

            $lookup = [
                'scope' => $scope,
                'parent_id' => $parentId,
                'type' => $type,
            ];

            if ($isRoute && is_string($routeName) && $routeName !== '') {
                $lookup['route_name'] = $routeName;
            } elseif (! $isRoute && is_string($url) && $url !== '') {
                $lookup['url'] = $url;
            } else {
                $lookup['title'] = $title;
            }

            $menuItem = MenuItem::updateOrCreate($lookup, [
                'title' => $title,
                'short_title' => $item['short_title'] ?? null,
                'icon' => $item['icon'] ?? null,

                'is_route' => $isRoute,
                'route_name' => $routeName,
                'url' => $url,

                'active_patterns' => $item['active_patterns'] ?? null,

                'sort' => $item['sort'] ?? $sort,

                'status' => (bool) ($item['status'] ?? true),
                'is_disabled' => (bool) ($item['is_disabled'] ?? false),
            ]);

            // 1) أنشئ permissions (لو مش موجودة)
            $permissionNames = $item['permission'] ?? [];
            if (! empty($permissionNames)) {
                foreach ($permissionNames as $p) {
                    Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
                }

                // 2) اربط permissions بالعنصر
                $permissionIds = Permission::whereIn('name', $permissionNames)->pluck('id')->all();
                $menuItem->permissions()->sync($permissionIds);
            }

            // 3) children recursion
            if ($hasChildren) {
                $this->seedItems($item['children'], $scope, $menuItem->id);
            }

            $sort++;
        }
    }
}
