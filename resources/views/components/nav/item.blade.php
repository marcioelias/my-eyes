@props([
    'href' => null,
    'icon' => null,
    'active' => null,
    'badge' => null,
])

{{--
    Sidebar link.

    "active" defaults to an exact URL match. Pass it explicitly for sections
    that should stay highlighted across child routes, e.g.
    :active="request()->routeIs('users.*')".
--}}

@php
    $active ??= filled($href) && request()->url() === url($href);
@endphp

<a
    href="{{ $href ?? '#' }}"
    {{ $attributes->class(['me-nav__item']) }}
    @if ($active) aria-current="page" @endif
>
    @if (filled($icon))
        <x-me::icon :name="$icon" />
    @endif

    <span class="me-hide-collapsed">{{ $slot }}</span>

    @if (filled($badge))
        <span class="me-hide-collapsed">
            <x-me::badge variant="primary">{{ $badge }}</x-me::badge>
        </span>
    @endif
</a>
