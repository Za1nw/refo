<?php

namespace Modules\MenuBuilder\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Route;
use Throwable;

class MenuItemResource extends JsonResource
{
    public static $wrap = 'menu';

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        // تحديد الرابط
        $href = $this->url;

        if ($this->is_route && filled($this->route_name) && Route::has($this->route_name)) {

            try {
                $href = route($this->route_name);
            } catch (Throwable) {
                $href = $this->url;
            }
        }

        // تحديد هل العنصر active
        $isActive = false;

        if ($this->active_patterns) {
            foreach ($this->active_patterns as $pattern) {
                if (request()->is($pattern)) {
                    $isActive = true;
                    break;
                }
            }
        }

        return [
            'id' => $this->id,
            'type' => $this->type, // link | group | header | divider

            'title' => t("menubuilder::menu.{$this->title}", $this->title),
            'icon' => $this->icon,

            'href' => $href,
            'is_route' => $this->is_route,
            'route_name' => $this->route_name,

            'active' => $isActive,
            'active_patterns' => $this->active_patterns,

            'disabled' => (bool) $this->is_disabled,
            'status' => (bool) $this->status,

            'children' => app()->make(MenuItemCollection::class, ['resource' => $this->children])->resolve($request),
        ];
    }
}
