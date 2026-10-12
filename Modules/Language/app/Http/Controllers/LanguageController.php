<?php

namespace Modules\Language\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Support\Inertia\InertiaModuleShare;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Modules\Language\Http\Requests\IndexLanguageRequest;
use Modules\Language\Http\Requests\UpdateLanguageRequest;
use Modules\Language\Services\LanguageTranslationService;
use Spatie\Permission\Middleware\PermissionMiddleware;

class LanguageController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(PermissionMiddleware::class.':view_language', only: ['index', 'show']),
            new Middleware(PermissionMiddleware::class.':add_language', only: ['create', 'store']),
            new Middleware(PermissionMiddleware::class.':edit_language', only: ['edit', 'update']),
            new Middleware(PermissionMiddleware::class.':delete_language', only: ['destroy']),
        ];
    }

    protected ?string $inertiaModuleConfigKey = 'language.name';

    protected ?string $inertiaModuleFallbackName = 'Language';

    protected array|string|null $inertiaTranslationNamespaces = 'language';

    public function __construct(
        InertiaModuleShare $inertiaShare,
        private readonly LanguageTranslationService $languageTranslationService,
    ) {
        parent::__construct($inertiaShare);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(IndexLanguageRequest $request): InertiaResponse
    {
        $filters = $request->validated();
        $indexUrl = route('languages.index');
        $perPage = (int) ($filters['per_page'] ?? $this->perPage);

        $files = $this->languageTranslationService->paginateFiles($filters, $perPage, $indexUrl);

        return Inertia::render('Language::lang', [
            'files' => [
                'data' => $files->items(),
                'meta' => [
                    'current_page' => $files->currentPage(),
                    'per_page' => $files->perPage(),
                    'total' => $files->total(),
                    'total_pages' => $files->lastPage(),
                ],
            ],
            'filters' => [
                'search' => (string) ($filters['search'] ?? ''),
                'namespace' => (string) ($filters['namespace'] ?? ''),
                'locale' => (string) ($filters['locale'] ?? app()->getLocale()),
                'per_page' => $perPage,
                'page' => (int) ($filters['page'] ?? 1),
                'sort_by' => (string) ($filters['sort_by'] ?? 'label'),
                'sort_order' => (string) ($filters['sort_order'] ?? 'asc'),
            ],
            'locales' => $this->languageTranslationService->availableLocales(),
            'indexUrl' => $indexUrl,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('languages.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('languages.index');
    }

    /**
     * Show the specified resource.
     */
    public function show($id): RedirectResponse
    {
        return redirect()->route('languages.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, string $namespace, string $group): InertiaResponse
    {
        $locale = (string) $request->string('locale', app()->getLocale());

        $filters = $request->only(['search', 'page', 'per_page']);

        return Inertia::render('Language::edit', [
            ...$this->languageTranslationService->editorPayload($namespace, $group, $locale, route('languages.index'), $filters),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLanguageRequest $request, string $namespace, string $group): RedirectResponse
    {
        $validated = $request->validated();
        $restoreSource = $request->boolean('restore_source');

        $this->languageTranslationService->saveTranslations(
            $namespace,
            $group,
            (string) $validated['locale'],
            $validated['translations'] ?? [],
            $restoreSource,
        );

        return redirect()
            ->route('languages.edit', [
                'namespace' => $namespace,
                'group' => $group,
                'locale' => $validated['locale'],
            ])
            ->with('success', __('Saved successfully.'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): RedirectResponse
    {
        return redirect()->route('languages.index');
    }
}
