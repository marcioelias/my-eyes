@props([
    'name' => null,
    'id' => null,
    'type' => 'text',
    'value' => null,
    'label' => null,
    'hint' => null,
    'error' => null,
    'size' => null,
    'required' => false,
    'prefix' => null,
    'suffix' => null,
])

@php
    $id ??= $name;

    // Validation errors are picked up from the bag automatically, so a field
    // only needs an explicit "error" when it is driven by something else.
    $error ??= $name ? $errors->first($name) : null;

    $value = $name && $type !== 'password' ? old($name, $value) : $value;

    $isPassword = $type === 'password';

    // The bordered wrapper is only needed when something sits beside the input.
    $grouped = filled($prefix) || filled($suffix) || $isPassword;

    $sizeClass = match ($size ?? config('my-eyes.defaults.size')) {
        'sm' => 'me-input--sm',
        'lg' => 'me-input--lg',
        default => null,
    };
@endphp

<x-me::field :label="$label" :hint="$hint" :error="$error" :for="$id" :required="$required">
    @if ($grouped)
        <div class="me-input-group">
            @if (filled($prefix))
                <span class="me-input-addon">{{ $prefix }}</span>
            @endif

            <input
                {{ $attributes->class(['me-input', $sizeClass]) }}
                type="{{ $type }}"
                @if ($id) id="{{ $id }}" @endif
                @if ($name) name="{{ $name }}" @endif
                @if (! is_null($value)) value="{{ $value }}" @endif
                @if ($required) required @endif
                @if ($error) aria-invalid="true" @endif
            />

            @if ($isPassword)
                <button
                    type="button"
                    class="me-input-addon me-input-addon--action"
                    data-me-password-toggle
                    data-label-show="{{ __('my-eyes::ui.password.show') }}"
                    data-label-hide="{{ __('my-eyes::ui.password.hide') }}"
                >
                    <x-me::icon name="eye" class="me-reveal-show" />
                    <x-me::icon name="eye-off" class="me-reveal-hide" />
                </button>
            @endif

            @if (filled($suffix))
                <span class="me-input-addon">{{ $suffix }}</span>
            @endif
        </div>
    @else
        <input
            {{ $attributes->class(['me-input', $sizeClass]) }}
            type="{{ $type }}"
            @if ($id) id="{{ $id }}" @endif
            @if ($name) name="{{ $name }}" @endif
            @if (! is_null($value)) value="{{ $value }}" @endif
            @if ($required) required @endif
            @if ($error) aria-invalid="true" @endif
        />
    @endif
</x-me::field>
