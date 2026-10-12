<?php

namespace App\Models\Traits;

use Illuminate\Support\Str;

trait HasSlug
{
    /**
     *  Set 'Name' attribute value.
     */
    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = trim($value);
        $this->attributes['slug'] = Str::slug($value);
    }
}
