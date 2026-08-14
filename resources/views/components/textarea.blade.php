@props([
    'name' => null,
    'id' => null,
    'value' => null,
    'label' => null,
    'hint' => null,
    'error' => null,
    'rows' => 4,
    'required' => false,
])

@php
    $id ??= $name;
    $error ??= $name ? $errors->first($name) : null;
    $value = $name ? old($name, $value) : $value;
@endphp

<x-me::field :label="$label" :hint="$hint" :error="$error" :for="$id" :required="$required">
    <textarea
        {{ $attributes->class(['me-input', 'me-textarea']) }}
        rows="{{ $rows }}"
        @if ($id) id="{{ $id }}" @endif
        @if ($name) name="{{ $name }}" @endif
        @if ($required) required @endif
        @if ($error) aria-invalid="true" @endif
    >{{ $value ?? $slot }}</textarea>
</x-me::field>
