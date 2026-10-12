<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) ($this->id ?? 0),
            'name' => (string) ($this->name ?? ''),
            'file_name' => (string) ($this->file_name ?? ''),
            'url' => $this->getUrl(),
            'size' => (int) ($this->size ?? 0),
            'order' => (int) ($this->order_column ?? 0),
            'thumb' => $this->safeUrl('thumb'),
            'small' => $this->safeUrl('small'),
            'medium' => $this->safeUrl('medium'),
            'large' => $this->safeUrl('large'),
            'hero' => $this->safeUrl('hero'),
            'square_hd' => $this->safeUrl('square_hd'),
            'thumb_hd' => $this->safeUrl('thumb_hd'),
        ];
    }

    protected function safeUrl(string $conversion): string
    {
        return $this->hasGeneratedConversion($conversion)
            ? $this->getUrl($conversion)
            : $this->getUrl();
    }
}
