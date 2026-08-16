@props(['name' => null, 'stroke' => 1.75])

{{--
    Inline icon set.

    Bundled rather than pulled from an icon package: the components need a
    predictable set, and shipping it here keeps my-eyes free of a runtime
    dependency. The geometry lives in resources/icons and is generated into
    MyEyes\Support\Icons by bin/build-icons.php.

    An icon set is a styling decision, so the set is open: add or override
    entries through the "icons" key in config/my-eyes.php, giving the inner
    geometry of a 24x24 SVG.

        'icons' => [
            'invoice' => '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/>',
        ],

    For a one-off drawing that does not belong in the set, pass the geometry as
    the slot and it comes out wearing the same wrapper as every other icon —
    same grid, same weight, same terminals:

        <x-me::icon>
            <path d="M4 20h16" />
        </x-me::icon>

    Copying the <svg> wrapper into an application instead is what makes a custom
    icon drift the day the design system changes it.
--}}

@php
    $paths = array_merge(\MyEyes\Support\Icons::PATHS, config('my-eyes.icons', []));

    /*
     * An unknown name is a mistake, not a runtime condition. Rendering an empty
     * <svg> hides it: the control loses its icon and nobody notices until a
     * screenshot looks wrong. It fails in debug, and degrades quietly in
     * production rather than taking a page down over a missing glyph.
     */
    if ($name !== null && ! isset($paths[$name]) && config('app.debug')) {
        throw new InvalidArgumentException(
            "Unknown my-eyes icon [{$name}]. Add it to resources/icons, or register it "
            ."under the \"icons\" key in config/my-eyes.php."
        );
    }
@endphp

<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="{{ $stroke }}"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    {{ $attributes }}
>{{-- The slot wins, and skips the lookup entirely. --}}@if (filled($slot)){{ $slot }}@else{!! $name === null ? '' : ($paths[$name] ?? '') !!}@endif</svg>
