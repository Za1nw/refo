<?php

namespace Modules\Blog\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $name = $this->getTranslation('name', app()->getLocale(), false)
            ?: $this->getTranslation('name', 'ar', false)
            ?: $this->getRawOriginal('name')
            ?: (string) $this->name;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $name,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
