@props([
    'name' => null,
    'id' => null,
    'value' => null,
    'label' => null,
    'hint' => null,
    'checked' => false,
    'card' => false,
])

{{--
    A single radio. Errors belong to the group rather than one option, so wrap
    a set in <x-me::field :error="..."> when you need to show one.
--}}

@php
    $id ??= $name && $value !== null ? "{$name}_{$value}" : $name;
    $checked = $name ? (string) old($name, $checked ? $value : null) === (string) $value : $checked;
@endphp

<label @class(['me-choice', 'me-choice--card' => $card]) @if ($id) for="{{ $id }}" @endif>
    <input
        {{ $attributes->class(['me-radio']) }}
        type="radio"
        @if ($value !== null) value="{{ $value }}" @endif
        @if ($id) id="{{ $id }}" @endif
        @if ($name) name="{{ $name }}" @endif
        @if ($checked) checked @endif
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
