<?php

namespace Modules\Blog\Transformers;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class BlogCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray(Request $request)
    {
        $pagination = $this->paginationMeta();

        return [
            'data' => $this->collection,
            ...$pagination,
        ];
    }

    private function paginationMeta(): array
    {
        if (! $this->resource instanceof LengthAwarePaginator) {
            return [];
        }

        return [
            'meta' => [
                'current_page' => $this->resource->currentPage(),
                'last_page' => $this->resource->lastPage(),
                'per_page' => $this->resource->perPage(),
                'total' => $this->resource->total(),
                'from' => $this->resource->firstItem(),
                'to' => $this->resource->lastItem(),
                'links' => $this->resource->linkCollection()->toArray(),
                'path' => $this->resource->path(),
            ],
            'links' => [
                'first' => $this->resource->url(1),
                'last' => $this->resource->url($this->resource->lastPage()),
                'prev' => $this->resource->previousPageUrl(),
                'next' => $this->resource->nextPageUrl(),
            ],
        ];
    }
}
