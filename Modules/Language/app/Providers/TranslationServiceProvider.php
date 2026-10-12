<?php

namespace Modules\Language\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Translation\Translator;
use Modules\Language\Helpers\CustomTranslationLoader;

class TranslationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->registerLoader();
        $this->registerTranslator();
    }

    protected function registerLoader()
    {
        unset($this->app['translation.loader']);

        $this->app->singleton('translation.loader', function ($app) {

            // المسار الأساسي للـ Laravel
            $paths = [$app['path.lang']];

            return new CustomTranslationLoader($app['files'], $paths);
        });

        $this->app->instance('translation.loader', $this->app->make('translation.loader'));
    }

    protected function registerTranslator()
    {
        unset($this->app['translator']);

        $this->app->singleton('translator', function ($app) {
            $loader = $app['translation.loader'];
            $locale = $app->getLocale();
            $trans = new Translator($loader, $locale);
            $trans->setFallback($app->getFallbackLocale());

            return $trans;
        });

        $this->app->instance('translator', $this->app->make('translator'));
    }

    public function boot(): void {}
}
