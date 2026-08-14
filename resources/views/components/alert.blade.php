@props([
    'variant' => 'info',
    'title' => null,
    'icon' => null,
    'dismissible' => false,
])

@php
    $icon ??= match ($variant) {
        'success' => 'check-circle',
        'danger' => 'alert-circle',
        'warning' => 'alert-triangle',
        default => 'info',
    };
@endphp

<div {{ $attributes->class(['me-alert', "me-alert--{$variant}"]) }} role="alert">
    @if ($icon !== false)
        <x-me::icon :name="$icon" class="me-alert__icon" />
    @endif

    <div class="me-alert__body">
        @if ($title)
            <span class="me-alert__title">{{ $title }}</span>
        @endif

        <span class="me-alert__text">{{ $slot }}</span>
    </div>

    @if ($dismissible)
        <button type="button" class="me-alert__dismiss" data-me-dismiss aria-label="{{ __('my-eyes::ui.common.dismiss') }}">
            <x-me::icon name="x" />
        </button>
    @endif
</div>
