<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    protected $fillable = [
        'translatable_id',
        'translatable_type',
        'locale',
        'field',
        'value',
    ];

    /**
     * العلاقة مع أي موديل (Post, Category, Tag ...)
     */
    public function translatable()
    {
        return $this->morphTo();
    }
}
