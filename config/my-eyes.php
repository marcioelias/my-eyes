<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Brand
    |--------------------------------------------------------------------------
    |
    | Shown in the sidebar header and on the auth screens. Set "logo" to the
    | name of a Blade component rendering your mark (for example "app.logo");
    | when null, the default my-eyes glyph is used.
    |
    */

    'brand' => [
        'name' => env('APP_NAME', 'Laravel'),
        'logo' => null,
    ],

    /*
    |--------------------------------------------------------------------------
    | Component defaults
    |--------------------------------------------------------------------------
    |
    | Applied whenever a component is used without an explicit size or variant.
    |
    */

    'defaults' => [
        'size' => 'md',
        'button_variant' => 'secondary',
    ],

    /*
    |--------------------------------------------------------------------------
    | Numeric formatting locale
    |--------------------------------------------------------------------------
    |
    | Decides the decimal and thousands separators used by <x-me::numeric />.
    | Null follows the application locale, which is usually what you want.
    |
    */

    'locale' => null,

    /*
    |--------------------------------------------------------------------------
    | Layout
    |--------------------------------------------------------------------------
    |
    | "footer" toggles the admin layout footer. "sidebar_collapsible" controls
    | whether the desktop rail can be collapsed to icons.
    |
    */

    'layout' => [
        'footer' => true,
        'sidebar_collapsible' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Vite entrypoints
    |--------------------------------------------------------------------------
    |
    | Loaded by the bundled layouts. Change these if your application does not
    | use the default Laravel asset paths.
    |
    */

    'vite' => [
        'resources/css/app.css',
        'resources/js/app.js',
    ],

];
