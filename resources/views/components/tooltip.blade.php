@props([
    'text',
    'placement' => 'top',
])

{{--
    Wraps anything in a tooltip.

        <x-me::tooltip text="{{ __('Delete order') }}" placement="top">
            <x-me::button variant="ghost" icon="x" />
        </x-me::tooltip>

    On an element you already control, skip the wrapper and use the attribute:

        <button data-me-tooltip="{{ __('Delete') }}" data-tooltip-placement="end">

    Shown on hover and on keyboard focus, and wired with aria-describedby, so it
    is announced rather than being decoration for mouse users only.

    Placements: top (default), bottom, start, end. The tooltip flips to the
    opposite side when the preferred one would run off screen.
--}}

<span
    {{ $attributes->class(['me-tooltip-trigger']) }}
    data-me-tooltip="{{ $text }}"
    data-tooltip-placement="{{ $placement }}"
>
    {{ $slot }}
</span>
