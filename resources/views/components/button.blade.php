@props([
    'variant' => null,
    'size' => null,
    'type' => 'button',
    'href' => null,
    'icon' => null,
    'block' => false,
    'loading' => false,
    'disabled' => false,
])

@php
    $variant ??= config('my-eyes.defaults.button_variant');
    $size ??= config('my-eyes.defaults.size');

    // An icon with no label gets square padding instead of a wide pill.
    $iconOnly = filled($icon) && trim($slot->toHtml()) === '';

    $classes = [
        'me-btn',
        "me-btn--{$variant}",
        "me-btn--{$size}",
        'me-btn--block' => $block,
        'me-btn--icon' => $iconOnly,
    ];
@endphp

@if ($href && ! $disabled)
    <a
        href="{{ $href }}"
        {{ $attributes->class($classes) }}
        @if ($loading) data-loading="true" @endif
    >
        @if (filled($icon))
            <x-me::icon :name="$icon" />
        @endif

        {{ $slot }}
    </a>
@else
    <button
        type="{{ $type }}"
        {{ $attributes->class($classes) }}
        @if ($disabled) disabled @endif
        @if ($loading) data-loading="true" @endif
    >
        @if (filled($icon))
            <x-me::icon :name="$icon" />
        @endif

        {{ $slot }}
    </button>
@endif
