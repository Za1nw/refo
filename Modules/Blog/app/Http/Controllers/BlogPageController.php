<?php

namespace Modules\Blog\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;
use Modules\Blog\Models\Blog;

class BlogPageController extends Controller
{
    public function index(): View
    {
        $articles = Blog::query()
            ->with(['media', 'category'])
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->paginate($this->perPage);

        $featuredPosts = Blog::query()
            ->with(['media', 'category'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return view('blog::pages.blogs', [
            'featuredPosts' => $featuredPosts,
            'articles' => $articles,
        ]);
    }

    public function show(Blog $blog): View
    {
        $blog->loadMissing(['category', 'media']);

        $relatedPosts = Blog::query()
            ->with(['media', 'category'])
            ->where('is_active', true)
            ->where('blogs.id', '!=', $blog->id)
            ->orderByRaw(
                'CASE WHEN blogs.category_id = ? THEN 2 WHEN EXISTS (
                    SELECT 1
                    FROM blog_to_tags AS related_tags
                    WHERE related_tags.blog_id = blogs.id
                      AND related_tags.tag_id IN (
                          SELECT current_tags.tag_id
                          FROM blog_to_tags AS current_tags
                          WHERE current_tags.blog_id = ?
                      )
                ) THEN 1 ELSE 0 END DESC',
                [$blog->category_id, $blog->id]
            )
            ->orderByDesc('blogs.created_at')
            ->limit(5)
            ->get();

        return view('blog::pages.blog-detail', [
            'blog' => $blog,
            'media' => $blog->media->first(),
            'relatedPosts' => $relatedPosts,
        ]);
    }
}
