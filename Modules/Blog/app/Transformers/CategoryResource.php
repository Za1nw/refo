<?php

namespace Modules\Blog\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $name = $this->getTranslation('name', app()->getLocale(), false)
            ?: $this->getTranslation('name', 'ar', false)
            ?: $this->getRawOriginal('name')
            ?: (string) $this->name;

        $description = $this->getTranslation('description', app()->getLocale(), false)
            ?: $this->getTranslation('description', 'ar', false)
            ?: $this->getRawOriginal('description')
            ?: (string) $this->description;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $name,
            'description' => $description,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
