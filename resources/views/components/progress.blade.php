@props([
    'value' => null,
    'max' => 100,
    'variant' => null,
    'size' => null,
    'label' => null,
    'showValue' => false,
])

{{--
    Linear progress bar.

    Omit `value` for the indeterminate form — work whose length is unknown.

        <x-me::progress :value="72" variant="success" label="Uploading" show-value />
        <x-me::progress variant="primary" />

    The wrapper is always rendered (it is a plain flex column, invisible on its
    own) so the bar markup exists in one place rather than once per branch.
--}}

@php
    $indeterminate = is_null($value);
    $percent = $indeterminate ? 0 : max(0, min(100, ($value / max($max, 1)) * 100));
    $hasHeader = filled($label) || ($showValue && ! $indeterminate);
@endphp

<div class="me-progress-field">
    @if ($hasHeader)
        <div class="me-progress-field__header">
            <span class="me-progress-field__label">{{ $label }}</span>

            @if ($showValue && ! $indeterminate)
                <span class="me-progress-field__value">{{ round($percent) }}%</span>
            @endif
        </div>
    @endif

    <div
        {{ $attributes->class([
            'me-progress',
            "me-progress--{$variant}" => filled($variant),
            "me-progress--{$size}" => filled($size),
            'me-progress--indeterminate' => $indeterminate,
        ]) }}
        role="progressbar"
        @if (! $indeterminate)
            aria-valuenow="{{ $value }}"
            aria-valuemin="0"
            aria-valuemax="{{ $max }}"
        @endif
        @if ($label) aria-label="{{ $label }}" @endif
        style="--me-progress: {{ $percent }}%"
    >
        <span class="me-progress__bar"></span>
    </div>
</div>
