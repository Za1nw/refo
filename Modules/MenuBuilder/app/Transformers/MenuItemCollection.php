<?php

namespace Modules\MenuBuilder\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class MenuItemCollection extends ResourceCollection
{
    public static $wrap = 'menus';

    public function __construct($resource, ?string $wrap = null)
    {
        parent::__construct($resource);
        MenuItemCollection::$wrap = $wrap ?? MenuItemCollection::$wrap;
    }

    /**
     * Transform the resource collection into an array.
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
