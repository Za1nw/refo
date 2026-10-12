<?php

namespace Modules\Blog\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Modules\Blog\Http\Requests\StoreBlogTagRequest;
use Modules\Blog\Http\Requests\UpdateBlogTagRequest;
use Modules\Blog\Http\Requests\UpdateBlogTagTranslationRequest;
use Modules\Blog\Models\BlogTag;
use Modules\Blog\Transformers\TagCollection;
use Modules\Blog\Transformers\TagResource;

class BlogTagController extends Controller
{
    protected ?string $inertiaModuleConfigKey = 'blog.name';

    protected ?string $inertiaModuleFallbackName = 'Blog';

    protected array|string|null $inertiaTranslationNamespaces = 'blog';

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $perPage = max(1, min(50, (int) $request->integer('per_page', $this->perPage)));
        $search = trim((string) $request->string('search'));
        $sortBy = (string) $request->string('sort_by', 'created_at');
        $sortOrder = strtolower((string) $request->string('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSortColumns = ['id', 'name', 'slug', 'is_active', 'created_at', 'updated_at'];
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }

        $tagsQuery = BlogTag::query();

        if ($search !== '') {
            $like = '%'.Str::of($search)->replace(['%', '_'], ['\\%', '\\_'])->toString().'%';

            $tagsQuery->where(function ($query) use ($like) {
                $query
                    ->where('name', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            });
        }

        $tags = $tagsQuery
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage)
            ->withQueryString();

        $resourceTags = [
            ...app(TagCollection::class, ['resource' => $tags])->toArray($request),
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
            ],
        ];

        if ($request->expectsJson()) {
            return response()->json($resourceTags);
        }

        return Inertia::render('Blog::blog-tags', [
            'tags' => $resourceTags,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('blog.tags.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlogTagRequest $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();
        $locale = app()->getLocale();

        $tag = new BlogTag([
            'slug' => Str::slug($validated['name']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $tag->setTranslations('name', [
            $locale => $validated['name'],
        ]);

        $tag->save();

        if ($request->expectsJson()) {
            return response()->json([
                'tag' => (new TagResource($tag))->toArray($request),
            ]);
        }

        return redirect()->route('blog.tags.index');
    }

    public function translate(Request $request, BlogTag $blogTag): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json([
                'translation' => [
                    'locale' => 'en',
                    'name' => $blogTag->getTranslation('name', 'en', false) ?? '',
                ],
            ]);
        }

        return redirect()->route('blog.tags.index');
    }

    public function updateTranslation(UpdateBlogTagTranslationRequest $request, BlogTag $blogTag): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();
        $locale = $validated['locale'] ?? 'en';

        $blogTag->setTranslation('name', $locale, $validated['name']);
        $blogTag->save();

        if ($request->expectsJson()) {
            return response()->json([
                'tag' => (new TagResource($blogTag))->toArray($request),
            ]);
        }

        return redirect()->route('blog.tags.index');
    }

    public function edit(): RedirectResponse
    {
        return redirect()->route('blog.tags.index');
    }

    /**
     * Show the specified resource.
     */
    public function show(): RedirectResponse
    {
        return redirect()->route('blog.tags.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function update(UpdateBlogTagRequest $request, BlogTag $blogTag): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();
        $locale = app()->getLocale();

        $blogTag->slug = Str::slug($validated['name']);
        $blogTag->is_active = $validated['is_active'] ?? $blogTag->is_active;
        $blogTag->setTranslations('name', [
            $locale => $validated['name'],
        ]);
        $blogTag->save();

        if ($request->expectsJson()) {
            return response()->json([
                'tag' => (new TagResource($blogTag))->toArray($request),
            ]);
        }

        return redirect()->route('blog.tags.index');
    }

    public function destroy(Request $request, BlogTag $blogTag): RedirectResponse|JsonResponse
    {
        $id = $blogTag->id;
        $blogTag->delete();

        if ($request->expectsJson()) {
            return response()->json(['id' => $id]);
        }

        return redirect()->route('blog.tags.index');
    }
}
