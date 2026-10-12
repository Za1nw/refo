<?php

namespace Modules\Settings\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\Settings\Services\SettingsService;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * Register bindings in the container.
     */
    public function register(): void
    {
        $this->app->singleton(SettingsService::class, function ($app) {
            return new SettingsService;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // load module helper (defines `setting()` function)
        $helpers = __DIR__.'/../../helpers.php';

        if (file_exists($helpers)) {
            require_once $helpers;
        }
    }
}
