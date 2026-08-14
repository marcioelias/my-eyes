@props([
    'value' => null,
    'max' => 100,
    'variant' => null,
    'size' => null,
    'label' => null,
    'showValue' => true,
])

{{--
    Circular progress. Omit `value` for a spinner.

        <x-me::progress-ring :value="64" variant="success" size="lg" />
--}}

@php
    $indeterminate = is_null($value);
    $percent = $indeterminate ? 25 : max(0, min(100, ($value / max($max, 1)) * 100));

    $classes = [
        'me-progress-ring',
        "me-progress-ring--{$variant}" => filled($variant),
        "me-progress-ring--{$size}" => filled($size),
        'me-progress-ring--indeterminate' => $indeterminate,
    ];
@endphp

<div
    {{ $attributes->class($classes) }}
    role="progressbar"
    @if (! $indeterminate)
        aria-valuenow="{{ $value }}"
        aria-valuemin="0"
        aria-valuemax="{{ $max }}"
    @endif
    @if ($label) aria-label="{{ $label }}" @endif
    style="--me-progress: {{ $percent }}%"
>
    @if ($showValue && ! $indeterminate)
        <span class="me-progress-ring__value">{{ round($percent) }}%</span>
    @endif
</div>
