@props([
    'variant' => null,
    'icon' => null,
    'dot' => false,
])

<span {{ $attributes->class(['me-badge', "me-badge--{$variant}" => filled($variant)]) }}>
    @if ($dot)
        <span @class(['me-dot', "me-dot--{$variant}" => filled($variant)])></span>
    @elseif (filled($icon))
        <x-me::icon :name="$icon" style="width:0.875rem;height:0.875rem" />
    @endif

    {{ $slot }}
</span>
