@props([
    'title' => null,
    'meta' => null,
])

<div {{ $attributes->class(['me-dropdown__header']) }}>
    @if ($title)
        <p class="me-dropdown__header-title">{{ $title }}</p>
    @endif

    @if ($meta)
        <p class="me-dropdown__header-meta">{{ $meta }}</p>
    @endif

    {{ $slot }}
</div>
