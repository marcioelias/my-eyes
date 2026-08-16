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
    | Icons
    |--------------------------------------------------------------------------
    |
    | Adds to the bundled set, or overrides one of it. Each entry is the inner
    | geometry of a 24x24 SVG — the <svg> wrapper is the component's, so stroke
    | width and colour stay under the design system's control.
    |
    |     'invoice' => '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/>',
    |
    */

    'icons' => [],

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
