@props([
    'name' => null,
    'id' => null,
    'options' => [],
    'selected' => null,
    'placeholder' => null,
    'label' => null,
    'hint' => null,
    'error' => null,
    'size' => null,
    'required' => false,
    'multiple' => false,
])

@php
    $id ??= $name;
    $error ??= $name ? $errors->first($name) : null;

    $selected = $name ? old($name, $selected) : $selected;
    $selectedValues = array_map('strval', is_array($selected) ? $selected : [$selected]);

    $sizeClass = match ($size ?? config('my-eyes.defaults.size')) {
        'sm' => 'me-input--sm',
        'lg' => 'me-input--lg',
        default => null,
    };
@endphp

<x-me::field :label="$label" :hint="$hint" :error="$error" :for="$id" :required="$required">
    <select
        {{ $attributes->class(['me-input', 'me-select', $sizeClass]) }}
        @if ($id) id="{{ $id }}" @endif
        @if ($name) name="{{ $name }}{{ $multiple ? '[]' : '' }}" @endif
        @if ($multiple) multiple @endif
        @if ($required) required @endif
        @if ($error) aria-invalid="true" @endif
    >
        @if ($placeholder)
            <option value="" @if (! array_filter($selectedValues, 'filled')) selected @endif>{{ $placeholder }}</option>
        @endif

        {{-- An options array wins; otherwise the slot supplies the markup. --}}
        @forelse ($options as $optionValue => $optionLabel)
            <option value="{{ $optionValue }}" @if (in_array((string) $optionValue, $selectedValues, true)) selected @endif>
                {{ $optionLabel }}
            </option>
        @empty
            {{ $slot }}
        @endforelse
    </select>
</x-me::field>
