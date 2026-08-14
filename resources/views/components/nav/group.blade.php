@props([
    'label' => null,
    'icon' => null,
    'open' => false,
])

{{--
    Collapsible nav section. The binding opens it automatically when any child
    carries aria-current, so the tree reflects the current page on load.
--}}

<div {{ $attributes->class(['me-nav__group']) }} data-me-nav-group data-open="{{ $open ? 'true' : 'false' }}">
    <button type="button" class="me-nav__item" data-me-nav-trigger>
        @if (filled($icon))
            <x-me::icon :name="$icon" />
        @endif

        <span class="me-hide-collapsed">{{ $label }}</span>

        <x-me::icon name="chevron-right" class="me-nav__chevron" />
    </button>

    <div class="me-nav__submenu-wrapper">
        <div class="me-nav__submenu">
            <ul class="me-nav__submenu-inner">
                {{ $slot }}
            </ul>
        </div>
    </div>
</div>
