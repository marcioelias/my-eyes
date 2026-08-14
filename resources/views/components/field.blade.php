@props([
    'label' => null,
    'hint' => null,
    'error' => null,
    'for' => null,
    'required' => false,
    'inline' => false,
])

{{-- Label / control / hint / error wrapper shared by every form component. --}}

<div {{ $attributes->class(['me-field', 'me-field--inline' => $inline]) }}>
    @if ($label)
        <label @if ($for) for="{{ $for }}" @endif @class(['me-label', 'me-label--required' => $required])>
            {{ $label }}
        </label>
    @endif

    {{ $slot }}

    @if ($hint && ! $error)
        <p class="me-hint">{{ $hint }}</p>
    @endif

    @if ($error)
        <p class="me-error">
            <x-me::icon name="alert-circle" />
            <span>{{ $error }}</span>
        </p>
    @endif
</div>
