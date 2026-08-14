@props([
    'name' => null,
    'id' => null,
    'value' => null,
    'label' => null,
    'hint' => null,
    'error' => null,
    'decimals' => null,
    'min' => null,
    'max' => null,
    'step' => 1,
    'prefix' => null,
    'suffix' => null,
    'grouping' => true,
    'locale' => null,
    'stepper' => true,
    'required' => false,
])

{{--
    Numeric input.

    Two inputs are rendered: a visible one formatted for the user's locale
    ("1.234,56") and a hidden one carrying the field name and the raw value
    ("1234.56"). The server therefore never parses a localised string, and the
    submitted value is already correct before any JavaScript runs.
--}}

@php
    $id ??= $name;
    $error ??= $name ? $errors->first($name) : null;
    $value = $name ? old($name, $value) : $value;
    $locale ??= config('my-eyes.locale') ?? str_replace('_', '-', app()->getLocale());
@endphp

<x-me::field :label="$label" :hint="$hint" :error="$error" :for="$id" :required="$required">
    <div
        class="me-input-group"
        data-me-numeric
        data-locale="{{ $locale }}"
        data-step="{{ $step }}"
        data-grouping="{{ $grouping ? 'true' : 'false' }}"
        @if (! is_null($decimals)) data-decimals="{{ $decimals }}" @endif
        @if (! is_null($min)) data-min="{{ $min }}" @endif
        @if (! is_null($max)) data-max="{{ $max }}" @endif
    >
        @if (filled($prefix))
            <span class="me-input-addon me-input-addon--bordered">{{ $prefix }}</span>
        @endif

        <input
            {{ $attributes->class(['me-input', 'me-input--numeric']) }}
            type="text"
            inputmode="decimal"
            autocomplete="off"
            data-me-numeric-display
            @if ($id) id="{{ $id }}" @endif
            @if ($required) required @endif
            @if ($error) aria-invalid="true" @endif
        />

        @if (filled($suffix))
            <span class="me-input-addon me-input-addon--bordered">{{ $suffix }}</span>
        @endif

        @if ($stepper)
            <div class="me-stepper">
                <button type="button" data-me-step-up tabindex="-1" aria-label="{{ __('my-eyes::ui.numeric.increase') }}">
                    <x-me::icon name="plus" stroke="2.5" />
                </button>
                <button type="button" data-me-step-down tabindex="-1" aria-label="{{ __('my-eyes::ui.numeric.decrease') }}">
                    <x-me::icon name="minus" stroke="2.5" />
                </button>
            </div>
        @endif

        <input
            type="hidden"
            data-me-numeric-value
            @if ($name) name="{{ $name }}" @endif
            value="{{ $value }}"
        />
    </div>
</x-me::field>
