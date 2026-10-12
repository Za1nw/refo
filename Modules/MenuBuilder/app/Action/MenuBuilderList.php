<?php

namespace Modules\MenuBuilder\Action;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Modules\MenuBuilder\Models\MenuItem;
use Modules\MenuBuilder\Transformers\MenuItemCollection;

class MenuBuilderList implements \Modules\MenuBuilder\Interfaces\Action\MenuBuilderList
{
    private $user;

    private string $scope;

    private ?string $wrap;

    public function __set($name, $value)
    {
        if ($name === 'scope') {
            $this->scope = $value;
        } elseif ($name === 'wrap') {
            $this->wrap = $value;
        }
    }

    public function __get($name)
    {
        if ($name === 'scope') {
            return $this->scope;
        } elseif ($name === 'wrap') {
            return $this->wrap;
        }

        return null;
    }

    // تقدر تمرر scope: admin_sidebar / admin_footer / admin_topbar ...
    public function __construct(string $scope = 'admin_sidebar', ?string $wrap = null)
    {
        $this->user = Auth::user();
        $this->scope = $scope;
        $this->wrap = $wrap;
    }

    public function handle(): MenuItemCollection
    {
        if (! $this->user) {
            return app()->make(MenuItemCollection::class, ['resource' => collect(), 'wrap' => $this->wrap]);
        }

        if (! app()->isProduction()) {
            $items = $this->fetchAllItems();

            return app()->make(MenuItemCollection::class, ['resource' => $this->buildTreeAndFilter($items), 'wrap' => $this->wrap]);
        }

        $version = MenuItem::getCacheVersion($this->scope);

        // Cache key مرتبط بالمستخدم + scope + version (يتغير تلقائيًا عند create/update/delete)
        $cacheKey = "menus:{$this->scope}:v{$version}:user:{$this->user->id}";

        $tree = Cache::remember($cacheKey, now()->addMinutes(10), function () {
            $items = $this->fetchAllItems();

            return $this->buildTreeAndFilter($items);
        });

        // $tree هنا Collection<MenuItem> جاهزة ومعها children relations
        return app()->make(MenuItemCollection::class, ['resource' => $tree, 'wrap' => $this->wrap]);
    }

    private function fetchAllItems(): Collection
    {
        // تحميل permissions لكل عنصر + children لاحقًا نحن نبنيها يدويًا (أفضل من eager recursive)
        return MenuItem::query()
            ->with(['permissions:id,name', 'children']) // لا نحتاج guard_name هنا غالبًا
            ->where('scope', $this->scope)
            ->where('status', true)
            ->orderBy('parent_id')
            ->orderBy('sort')
            ->get();
    }

    private function buildTreeAndFilter(Collection $items): Collection
    {
        // group items by parent_id for fast lookup
        $byParent = $items->groupBy('parent_id');
        $walk = function ($parentId) use (&$walk, $byParent): Collection {
            $nodes = collect($byParent->get($parentId, []));
            $result = $nodes->map(function ($item) use ($walk) {
                // فلترة الصلاحيات للعنصر نفسه
                if (! $this->isAllowed($item)) {
                    return null;
                }

                // ابناؤه
                $children = $walk($item->id);

                // اخفاء العناصر التجميعية الفارغة
                if (in_array($item->type, ['group', 'header', 'dropdown'], true) && $children->isEmpty()) {
                    return null;
                }

                // ربط children في الـ relation حتى الـ Resource يقرأها
                $item->setRelation('children', $children);

                return $item;
            })->filter()->values();

            return $result;
        };

        return $walk(null);
    }

    private function isAllowed(MenuItem $item): bool
    {
        // لو ما عليه permissions -> يظهر
        if (! $item->relationLoaded('permissions') || $item->permissions->isEmpty()) {
            return true;
        }

        $names = $item->permissions->pluck('name')->all();
        \Log::info("Checking permissions for menu item '{$item->title}': ".implode(', ', $names));

        // AND logic (لازم كل الصلاحيات)
        return $this->user->hasAnyPermission($names);
    }
}
