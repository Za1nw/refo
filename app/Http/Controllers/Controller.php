<?php

namespace App\Http\Controllers;

use App\Support\Inertia\InertiaModuleShare;

abstract class Controller
{
    protected int $perPage = 20;

    protected ?string $inertiaModuleConfigKey = null;

    protected ?string $inertiaModuleFallbackName = null;

    /** @var array<string>|string|null */
    protected array|string|null $inertiaTranslationNamespaces = null;

    /** @var array<string>|string */
    protected array|string $inertiaTranslationGroups = ['*'];

    public function __construct(
        protected InertiaModuleShare $inertiaShare
    ) {
        $this->bootInertia();
        $this->shareInertiaModule();
    }

    /**
     * Boot Inertia environment (locale, direction, shared props)
     */
    protected function bootInertia(): void
    {
        if (! request()->header('X-Inertia')) {
            return;
        }

        app()->setLocale('ar');

        inertia()->share([
            'direction' => $this->resolveDirection(),
        ]);
    }

    /**
     * Determine layout direction
     */
    protected function resolveDirection(): string
    {
        return in_array(
            app()->getLocale(),
            config('app.rtl_locales', []),
            true
        ) ? 'rtl' : 'ltr';
    }

    /**
     * Share module-specific Inertia data
     */
    protected function shareInertiaModule(): void
    {
        if (! $this->isModuleSharingEnabled()) {
            return;
        }

        $this->inertiaTranslationGroups[] = 'main';

        $this->inertiaShare->share(
            moduleConfigKey: $this->inertiaModuleConfigKey,
            moduleFallbackName: $this->inertiaModuleFallbackName,
            translationNamespaces: $this->inertiaTranslationNamespaces,
            translationGroups: $this->inertiaTranslationGroups,
        );
    }

    /**
     * Validate module sharing readiness
     */
    protected function isModuleSharingEnabled(): bool
    {
        return $this->inertiaModuleConfigKey !== null
            && $this->inertiaModuleFallbackName !== null;
    }
}
