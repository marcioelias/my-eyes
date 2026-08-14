@props([
    'href' => null,
    'name' => null,
    'showName' => true,
])

{{--
    Application mark. Set my-eyes.brand.logo to the name of your own component
    (e.g. "app.logo") to replace the default glyph everywhere at once.
--}}

@php
    $name ??= config('my-eyes.brand.name');
    $logo = config('my-eyes.brand.logo');
@endphp

<a href="{{ $href ?? url('/') }}" {{ $attributes->class(['me-sidebar__brand']) }}>
    @if ($logo)
        <x-dynamic-component :component="$logo" />
    @else
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--color-primary-600)" />
            <path
                d="M6 16c0-3 4.5-6 10-6s10 3 10 6-4.5 6-10 6-10-3-10-6z"
                stroke="#fff"
                stroke-width="2"
                stroke-linejoin="round"
            />
            <circle cx="16" cy="16" r="3" fill="#fff" />
        </svg>
    @endif

    @if ($showName)
        <span class="me-hide-collapsed">{{ $name }}</span>
    @endif
</a>
