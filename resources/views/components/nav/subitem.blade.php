@props([
    'href' => null,
    'active' => null,
])

@php
    $active ??= filled($href) && request()->url() === url($href);
@endphp

<li>
    <a
        href="{{ $href ?? '#' }}"
        {{ $attributes->class(['me-nav__subitem']) }}
        @if ($active) aria-current="page" @endif
    >
        {{ $slot }}
    </a>
</li>
