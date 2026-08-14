@props([
    'name' => null,
    'src' => null,
    'size' => null,
    'status' => null,
])

@php
    // Initials: first letter of the first and last word, so "Márcio Elias" -> "ME".
    $words = preg_split('/\s+/', trim((string) $name), -1, PREG_SPLIT_NO_EMPTY) ?: [];

    $initials = match (count($words)) {
        0 => '',
        1 => mb_strtoupper(mb_substr($words[0], 0, 2)),
        default => mb_strtoupper(mb_substr($words[0], 0, 1).mb_substr(end($words), 0, 1)),
    };

    $classes = ['me-avatar', "me-avatar--{$size}" => filled($size)];
@endphp

@if ($status)
    <span class="me-avatar-wrap">
        <span {{ $attributes->class($classes) }}>
            @if ($src)
                <img src="{{ $src }}" alt="{{ $name }}" />
            @else
                {{ $initials }}
            @endif
        </span>
        <span class="me-dot me-dot--{{ $status }}"></span>
    </span>
@else
    <span {{ $attributes->class($classes) }}>
        @if ($src)
            <img src="{{ $src }}" alt="{{ $name }}" />
        @else
            {{ $initials }}
        @endif
    </span>
@endif
