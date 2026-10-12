<?php

namespace Modules\Blog\Models;

use App\Models\BaseModel;
use App\Models\Traits\HasSlug;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Blog\Database\Factories\BlogFactory;

class Blog extends BaseModel
{
    use HasFactory, HasSlug, HasTranslations;

    protected $fillable = [
        'slug',
        'views',
        'is_active',
        'is_featured',
        'category_id',
        'title',
        'description',
        'content',
    ];

    protected $casts = [
        'views' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * الحقول القابلة للترجمة
     */
    protected array $translatlable = [
        'title',
        'description',
        'content',
    ];

    protected static function newFactory(): BlogFactory
    {
        return BlogFactory::new();
    }

    public function category()
    {
        return $this->belongsTo(BlogCategory::class);
    }

    public function tags()
    {
        return $this->belongsToMany(
            BlogTag::class,
            'blog_to_tags',
            'blog_id',
            'tag_id'
        );
    }
}
