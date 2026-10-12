<?php

namespace Modules\Blog\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Modules\Blog\Http\Requests\BlogUpdateRequest;
use Modules\Blog\Models\Blog;
use Modules\Blog\Transformers\BlogCollection;
use Modules\Blog\Transformers\BlogResource;
use Spatie\Permission\Middleware\PermissionMiddleware;

class BlogController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(PermissionMiddleware::class.':view_blog', only: ['index', 'show']),
            new Middleware(PermissionMiddleware::class.':add_blog', only: ['create', 'store']),
            new Middleware(PermissionMiddleware::class.':edit_blog', only: ['edit', 'update', 'translate', 'updateTranslation']),
            new Middleware(PermissionMiddleware::class.':delete_blog', only: ['destroy']),
        ];
    }

    protected ?string $inertiaModuleConfigKey = 'blog.name';

    protected ?string $inertiaModuleFallbackName = 'Blog';

    protected array|string|null $inertiaTranslationNamespaces = 'blog';

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', $this->perPage);
        $perPage = max(1, min(50, $perPage));

        $search = trim((string) $request->string('search'));
        $sortBy = (string) $request->string('sort_by', 'created_at');
        $sortOrder = strtolower((string) $request->string('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $categoryId = (int) $request->integer('category_id');
        $status = (string) $request->string('status', 'all');

        $blogsQuery = Blog::query()->with(['media', 'category', 'tags']);
        $allowedSortColumns = ['id', 'title', 'slug', 'created_at', 'updated_at'];
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }

        if ($categoryId > 0) {
            $blogsQuery->where('category_id', $categoryId);
        }

        if ($status === 'active') {
            $blogsQuery->where('is_active', true);
        } elseif ($status === 'inactive') {
            $blogsQuery->where('is_active', false);
        }

        if ($search !== '') {
            $like = '%'.Str::of($search)->replace(['%', '_'], ['\\%', '\\_'])->toString().'%';

            $blogsQuery->where(function ($query) use ($like) {
                $query
                    ->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like)
                    ->orWhere('short_description', 'like', $like)
                    ->orWhere('description', 'like', $like);
            });
        }

        $blogs = $blogsQuery
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage)
            ->withQueryString();

        $resourceBlog = [
            ...app(BlogCollection::class, ['resource' => $blogs])->toArray($request),

            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
                'category_id' => $categoryId > 0 ? $categoryId : 'all',
                'status' => $status,
            ],
        ];
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($resourceBlog);
        }

        return Inertia::render('Blog::blog', ['blogs' => $resourceBlog]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Blog::blog-create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BlogUpdateRequest $request)
    {
        $validated = $request->validated();

        $slugSource = (string) ($validated['slug'] ?? $validated['title']);
        $slug = Str::slug($slugSource);
        if ($slug === '') {
            $slug = 'blog-'.Str::lower(Str::random(10));
        }

        $blog = new Blog;
        $blog->slug = $slug;
        $blog->views = 0;
        $blog->category_id = $validated['category_id'] ?? null;
        $blog->is_featured = false;
        $blog->save();

        $blog->setTranslations([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'content' => $validated['content'] ?? '',
        ], app()->getLocale());

        if ($request->hasFile('image')) {
            $blog->clearMediaCollection();
            $blog->addMediaFromRequest('image')->toMediaCollection();
        }

        $this->syncFeaturedBlog($blog, (bool) $validated['is_featured']);

        return redirect()->route('blog.edit', $blog);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog)
    {
        $resource = app(BlogResource::class, ['resource' => $blog->load(['media', 'category', 'tags'])])->toArray(request());

        return Inertia::render('Blog::blog-edit', [
            'blog' => $resource,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BlogUpdateRequest $request, Blog $blog)
    {
        $validated = $request->validated();

        $blog->category_id = $validated['category_id'] ?? null;
        $blog->is_active = $validated['is_active'];
        $blog->tags()->sync($validated['tag_ids'] ?? []);
        $blog->save();

        $blog->setTranslations([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'content' => $validated['content'] ?? '',
        ], app()->getLocale());

        if ($request->hasFile('image')) {
            $blog->clearMediaCollection();
            $blog->addMediaFromRequest('image')->toMediaCollection();
        }

        $this->syncFeaturedBlog($blog, (bool) $validated['is_featured']);

        return redirect()->back();
    }

    public function translate(Blog $blog)
    {
        $resource = app(BlogResource::class, ['resource' => $blog->load(['media', 'category', 'tags'])])->toArray(request());

        return Inertia::render('Blog::blog-translate', [
            'blog' => $resource,
            'translations' => [
                'locale' => 'en',
                'title' => $blog->t('title', 'en', ''),
                'description' => $blog->t('description', 'en', ''),
                'content' => $blog->t('content', 'en', ''),
            ],
        ]);
    }

    public function updateTranslation(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
        ]);

        $blog->setTranslations([
            'title' => $validated['title'] ?? '',
            'description' => $validated['description'] ?? '',
            'content' => $validated['content'] ?? '',
        ], 'en');

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog)
    {
        try {
            $blog->delete();

            return response()->json(['message' => 'Blog deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete blog'], 500);
        }
    }

    protected function syncFeaturedBlog(Blog $blog, bool $isFeatured): void
    {
        if ($blog->is_featured !== $isFeatured) {
            $blog->forceFill(['is_featured' => $isFeatured])->save();
        }
    }
}
