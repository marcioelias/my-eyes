@props(['title' => null])

<div {{ $attributes->class(['me-nav__section']) }}>
    @if ($title)
        <p class="me-nav__section-title me-hide-collapsed">{{ $title }}</p>
    @endif

    {{ $slot }}
</div>
