<?php

namespace Modules\Blog\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Modules\Blog\Http\Requests\StoreBlogCategoryRequest;
use Modules\Blog\Http\Requests\UpdateBlogCategoryRequest;
use Modules\Blog\Http\Requests\UpdateBlogCategoryTranslationRequest;
use Modules\Blog\Models\BlogCategory;
use Modules\Blog\Transformers\CategoryCollection;
use Modules\Blog\Transformers\CategoryResource;

class BlogCategoryController extends Controller
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

        $allowedSortColumns = ['id', 'name', 'slug', 'description', 'is_active', 'created_at', 'updated_at'];
        if (! in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }

        $categoriesQuery = BlogCategory::query();

        if ($search !== '') {
            $like = '%'.Str::of($search)->replace(['%', '_'], ['\\%', '\\_'])->toString().'%';

            $categoriesQuery->where(function ($query) use ($like) {
                $query
                    ->where('name', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            });
        }

        $categories = $categoriesQuery
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage)
            ->withQueryString();

        $resourceCategories = [
            ...app(CategoryCollection::class, ['resource' => $categories])->toArray($request),
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
            ],
        ];

        if ($request->expectsJson()) {
            return response()->json($resourceCategories);
        }

        return Inertia::render('Blog::blog-categories', [
            'categories' => $resourceCategories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('blog.categories.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlogCategoryRequest $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();
        $locale = app()->getLocale();

        $cat = new BlogCategory([
            'slug' => Str::slug($validated['name']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $cat->setTranslations('name', [
            $locale => $validated['name'],
        ]);

        $cat->setTranslations('description', [
            $locale => $validated['description'] ?? '',
        ]);

        $cat->save();

        if ($request->expectsJson()) {
            return response()->json([
                'category' => (new CategoryResource($cat))->toArray($request),
            ]);
        }

        return redirect()->route('blog.categories.index');
    }

    public function translate(Request $request, BlogCategory $blogCategory): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json([
                'translation' => [
                    'locale' => 'en',
                    'name' => $blogCategory->getTranslation('name', 'en', false) ?? '',
                    'description' => $blogCategory->getTranslation('description', 'en', false) ?? '',
                ],
            ]);
        }

        return redirect()->route('blog.categories.index');
    }

    public function updateTranslation(UpdateBlogCategoryTranslationRequest $request, BlogCategory $blogCategory): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();
        $locale = $validated['locale'] ?? 'en';

        $blogCategory->setTranslation('name', $locale, $validated['name']);
        $blogCategory->setTranslation('description', $locale, $validated['description'] ?? '');
        $blogCategory->save();

        if ($request->expectsJson()) {
            return response()->json([
                'category' => (new CategoryResource($blogCategory))->toArray($request),
            ]);
        }

        return redirect()->route('blog.categories.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(): RedirectResponse
    {
        return redirect()->route('blog.categories.index');
    }

    /**
     * Show the specified resource.
     */
    public function show(): RedirectResponse
    {
        return redirect()->route('blog.categories.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function update(UpdateBlogCategoryRequest $request, BlogCategory $blogCategory): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();
        $locale = app()->getLocale();

        $blogCategory->slug = Str::slug($validated['name']);
        $blogCategory->is_active = $validated['is_active'] ?? $blogCategory->is_active;
        $blogCategory->setTranslations('name', [
            $locale => $validated['name'],
        ]);
        $blogCategory->setTranslations('description', [
            $locale => $validated['description'] ?? '',
        ]);
        $blogCategory->save();

        if ($request->expectsJson()) {
            return response()->json([
                'category' => (new CategoryResource($blogCategory))->toArray($request),
            ]);
        }

        return redirect()->route('blog.categories.index');
    }

    public function destroy(Request $request, BlogCategory $blogCategory): RedirectResponse|JsonResponse
    {
        $id = $blogCategory->id;
        $blogCategory->delete();

        if ($request->expectsJson()) {
            return response()->json(['id' => $id]);
        }

        return redirect()->route('blog.categories.index');
    }
}
