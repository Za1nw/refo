<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Translation\Translator;
use Illuminate\Validation\Rules\Password;
use Modules\Language\Helpers\CustomTranslationLoader;
use Modules\Language\Providers\LanguageServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void {}

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->app->register(LanguageServiceProvider::class);
        $this->app->booted(function (): void {
            $this->registerLanguageTranslationBindings();
        });
    }

    protected function registerLanguageTranslationBindings(): void
    {
        config(['language.provider_loaded' => true]);

        /** @var Filesystem $files */
        $files = $this->app->make('files');

        $loader = new CustomTranslationLoader($files, [lang_path()]);

        // Replace the container translator with a DB-first translator that
        // checks the `languages` table before falling back to files.
        $dbTranslatorClass = \Modules\Language\Helpers\DbFirstTranslator::class;
        if (class_exists($dbTranslatorClass)) {
            $dbTranslator = new $dbTranslatorClass($loader, $this->app->getLocale());
            $dbTranslator->setFallback(config('app.fallback_locale'));
            $this->app->instance('translator', $dbTranslator);
            $this->app->instance('translation.loader', $loader);
        } else {
            // Fallback: bind loader and translator normally.
            $this->app->instance('translation.loader', $loader);
            $newTranslator = new Translator($loader, $this->app->getLocale());
            $newTranslator->setFallback(config('app.fallback_locale'));
            $this->app->instance('translator', $newTranslator);
        }
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        RedirectIfAuthenticated::redirectUsing(function (Request $request): string {
            return config('fortify.home');
        });

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null
        );
    }
}
