@props([
    'name' => null,
    'id' => null,
    'value' => '1',
    'label' => null,
    'hint' => null,
    'error' => null,
    'checked' => false,
    'size' => null,
])

{{--
    The visible track/thumb cannot be an <input>, so a visually hidden checkbox
    drives it. That keeps native form submission, keyboard toggling and the
    label association intact.
--}}

@php
    $id ??= $name;
    $error ??= $name ? $errors->first($name) : null;
    $checked = $name ? (bool) old($name, $checked) : $checked;
@endphp

<div class="me-field">
    <label @class(['me-switch', 'me-switch--lg' => $size === 'lg']) @if ($id) for="{{ $id }}" @endif>
        <input
            {{ $attributes->class(['me-switch__input']) }}
            type="checkbox"
            role="switch"
            value="{{ $value }}"
            @if ($id) id="{{ $id }}" @endif
            @if ($name) name="{{ $name }}" @endif
            @if ($checked) checked @endif
        />

        <span class="me-switch__track" aria-hidden="true">
            <span class="me-switch__thumb"></span>
        </span>

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
