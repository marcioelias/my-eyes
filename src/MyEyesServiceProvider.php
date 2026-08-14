<?php

declare(strict_types=1);

namespace MyEyes;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

final class MyEyesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/my-eyes.php', 'my-eyes');
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'my-eyes');
        $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'my-eyes');

        // Components are anonymous Blade views, so <x-me::button /> needs no PHP class.
        Blade::anonymousComponentPath(__DIR__.'/../resources/views/components', 'me');

        if ($this->app->runningInConsole()) {
            $this->registerPublishing();
        }
    }

    private function registerPublishing(): void
    {
        $this->publishes([
            __DIR__.'/../config/my-eyes.php' => config_path('my-eyes.php'),
        ], 'my-eyes-config');

        // Overrides individual components without forking the package.
        $this->publishes([
            __DIR__.'/../resources/views/components' => resource_path('views/vendor/my-eyes/components'),
        ], 'my-eyes-components');

        /*
         * Starter kit screens are published rather than rendered from the
         * package: they are the pages an application is expected to own and
         * edit, and they need routes and controllers the package does not
         * provide (Fortify, Breeze or your own).
         */
        $this->publishes([
            __DIR__.'/../resources/views/pages' => resource_path('views'),
        ], 'my-eyes-pages');

        $this->publishes([
            __DIR__.'/../resources/views/errors' => resource_path('views/errors'),
        ], 'my-eyes-errors');

        $this->publishes([
            __DIR__.'/../resources/lang' => lang_path('vendor/my-eyes'),
        ], 'my-eyes-lang');
    }
}
