@props([
    'name' => null,
    'id' => null,
    'value' => '1',
    'label' => null,
    'hint' => null,
    'error' => null,
    'checked' => false,
    'card' => false,
])

@php
    $id ??= $name;
    $error ??= $name ? $errors->first($name) : null;
    $checked = $name ? (bool) old($name, $checked) : $checked;
@endphp

<div class="me-field">
    <label @class(['me-choice', 'me-choice--card' => $card]) @if ($id) for="{{ $id }}" @endif>
        <input
            {{ $attributes->class(['me-check']) }}
            type="checkbox"
            value="{{ $value }}"
            @if ($id) id="{{ $id }}" @endif
            @if ($name) name="{{ $name }}" @endif
            @if ($checked) checked @endif
            @if ($error) aria-invalid="true" @endif
        />

        @if ($label || $hint || filled($slot))
            <span class="me-choice__body">
                @if ($label)
                    <span class="me-choice__label">{{ $label }}</span>
                @endif

                @if ($hint)
                    <span class="me-choice__hint">{{ $hint }}</span>
                @endif

                {{ $slot }}
            </span>
        @endif
    </label>

    @if ($error)
        <p class="me-error">
            <x-me::icon name="alert-circle" />
            <span>{{ $error }}</span>
        </p>
    @endif
</div>
