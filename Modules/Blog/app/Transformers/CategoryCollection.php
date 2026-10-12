<?php

namespace Modules\Blog\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray(Request $request)
    {
        return [
            'data' => $this->collection->map(
                fn ($category) => (new CategoryResource($category))->toArray($request)
            )->all(),
            ...$this->paginationMeta(),
        ];
    }

    private function paginationMeta(): array
    {
        if (! method_exists($this->resource, 'currentPage')) {
            return [];
        }

        /** @var object $resource */
        $resource = $this->resource;

        return [
            'meta' => [
                'current_page' => $resource->currentPage(),
                'last_page' => $resource->lastPage(),
                'per_page' => $resource->perPage(),
                'total' => $resource->total(),
                'from' => $resource->firstItem(),
                'to' => $resource->lastItem(),
                'path' => $resource->path(),
            ],
            'links' => [
                'first' => $resource->url(1),
                'last' => $resource->url($resource->lastPage()),
                'prev' => $resource->previousPageUrl(),
                'next' => $resource->nextPageUrl(),
            ],
        ];
    }
}
