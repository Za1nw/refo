<?php

namespace Modules\MenuBuilder\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Modules\MenuBuilder\Interfaces\Action\MenuBuilderList;
use Modules\MenuBuilder\Interfaces\Response\MenuItemResponse;

class MenuBuilderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, MenuBuilderList $menuBuilderList)
    {
        $mainData = $menuBuilderList->handle()->resolve($request);

        $footerList = app()->make(MenuBuilderList::class, ['scope' => 'admin_footer']);
        $footerData = $footerList->handle()->resolve($request);

        $groupedMain = $this->groupSidebarMenu($mainData, $request);

        $menuItemResponse = app()->make(MenuItemResponse::class, [
            'data' => [
                'main' => $groupedMain,
                'footer' => $footerData,
            ],
        ]);

        return $menuItemResponse;
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array{title: string, items: array<int, mixed>}>
     */
    private function groupSidebarMenu(array $items, Request $request): array
    {
        $groups = [];
        $defaultItems = [];

        foreach ($items as $item) {
            $type = $item['type'] ?? 'link';

            if (in_array($type, ['divider'], true)) {
                continue;
            }

            if (in_array($type, ['group', 'header'], true)) {
                $children = $this->resolveChildren($item['children'] ?? null, $request);

                $groups[] = [
                    'title' => (string) ($item['title'] ?? ''),
                    'items' => $children,
                ];

                continue;
            }

            $defaultItems[] = $item;
        }

        if (count($defaultItems) > 0) {
            array_unshift($groups, [
                'title' => t('menubuilder::menu.default'),
                'items' => $defaultItems,
            ]);
        }

        return $groups;
    }

    /**
     * @return array<int, mixed>
     */
    private function resolveChildren(mixed $children, Request $request): array
    {
        if (is_array($children)) {
            return $children;
        }

        if ($children instanceof JsonResource || $children instanceof ResourceCollection) {
            $resolved = $children->resolve($request);

            return is_array($resolved) ? $resolved : [];
        }

        if ($children instanceof Arrayable) {
            $resolved = $children->toArray();

            return is_array($resolved) ? $resolved : [];
        }

        if ($children instanceof \JsonSerializable) {
            $resolved = $children->jsonSerialize();

            return is_array($resolved) ? $resolved : [];
        }

        return [];
    }
}
