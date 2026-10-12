<?php

namespace Modules\Blog\Models;

use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Blog\Database\Factories\BlogTagFactory;
use Spatie\Translatable\HasTranslations;

class BlogTag extends Model
{
    use HasFactory, HasSlug, HasTranslations;

    /**
     * The attributes that are translatable.
     *
     * @var array<int, string>
     */
    public array $translatable = [
        'name',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'is_active',
        'name',
        'slug',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function newFactory(): BlogTagFactory
    {
        return BlogTagFactory::new();
    }
}
