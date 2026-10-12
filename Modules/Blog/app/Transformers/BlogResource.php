<?php

namespace Modules\Blog\Transformers;

use App\Http\Resources\MediaResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'views' => $this->views,
            'title' => $this->title,
            'description' => $this->description,
            'content' => $this->content,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'category' => $this->whenLoaded('category') ? new CategoryResource($this->category) : null,
            'tags' => TagCollection::make($this->whenLoaded('tags')),
            'image' => $this->whenLoaded('media') && $this->media->first()
                ? app(MediaResource::class, ['resource' => $this->media->first()])
                : null,
            'readable_date' => $this->created_at->diffForHumans(),
            // formatting SA date as Y-m-d for easier handling on frontend, but keeping created_at and updated_at for reference
            'created_at' => $this->created_at->format('Y-m-d'),
            'updated_at' => $this->updated_at->format('Y-m-d'),
        ];
    }
}
