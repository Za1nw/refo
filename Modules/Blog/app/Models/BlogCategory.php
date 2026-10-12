<?php

namespace Modules\Blog\Models;

use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Blog\Database\Factories\BlogCategoryFactory;
use Spatie\Translatable\HasTranslations;

class BlogCategory extends Model
{
    use HasFactory, HasSlug, HasTranslations;

    /**
     * The attributes that are translatable.
     *
     * @var array<int, string>
     */
    public $translatable = [
        'name',
        'description',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id',
        'is_active',
        'slug',
        'name',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function newFactory(): BlogCategoryFactory
    {
        return BlogCategoryFactory::new();
    }
}
