@props([
    'href' => null,
    'icon' => null,
    'variant' => null,
    'keepOpen' => false,
])

@php
    $classes = ['me-dropdown__item', "me-dropdown__item--{$variant}" => filled($variant)];
@endphp

@if ($href)
    <a
        href="{{ $href }}"
        {{ $attributes->class($classes) }}
        role="menuitem"
        @if ($keepOpen) data-me-keep-open @endif
    >
        @if (filled($icon))
            <x-me::icon :name="$icon" />
        @endif

        {{ $slot }}
    </a>
@else
    <button
        type="{{ $attributes->get('type', 'button') }}"
        {{ $attributes->class($classes)->except('type') }}
        role="menuitem"
        @if ($keepOpen) data-me-keep-open @endif
    >
        @if (filled($icon))
            <x-me::icon :name="$icon" />
        @endif

        {{ $slot }}
    </button>
@endif
