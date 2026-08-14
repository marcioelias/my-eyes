@props([
    'name' => null,
    'id' => null,
    'options' => [],
    'selected' => null,
    'label' => null,
    'hint' => null,
    'error' => null,
    'placeholder' => null,
    'multiple' => false,
    'searchable' => true,
    'clearable' => true,
    'required' => false,
])

{{--
    Custom select with its own rendered list.

    Use it for multiple selection, searching, option descriptions, groups or
    disabled options. For a plain list of values prefer <x-me::select>, the
    native element — it gets the platform picker on mobile and costs nothing.

        <x-me::select-field
            name="tags"
            :label="__('Tags')"
            multiple
            :options="[
                ['value' => 'php', 'label' => 'PHP'],
                ['value' => 'js', 'label' => 'JavaScript', 'description' => 'Browser and Node'],
                ['value' => 'go', 'label' => 'Go', 'disabled' => true],
                ['value' => 'sql', 'label' => 'SQL', 'group' => 'Data'],
            ]"
        />

    A flat ['php' => 'PHP'] map is accepted too and expanded to that shape.

    Values are submitted through hidden inputs kept in sync with the selection,
    so the field posts like any other — the server needs nothing special.

    Requires JavaScript to open. When it matters that the control works without
    it, use the native <x-me::select>.
--}}

@php
    $id ??= $name;
    $error ??= $name ? $errors->first($name) : null;

    // Accept both the verbose array-of-arrays form and a simple value => label map.
    $normalised = collect($options)->map(function ($option, $key) {
        if (! is_array($option)) {
            return ['value' => (string) $key, 'label' => (string) $option];
        }

        return [
            'value' => (string) ($option['value'] ?? $key),
            'label' => (string) ($option['label'] ?? $option['value'] ?? $key),
            'disabled' => (bool) ($option['disabled'] ?? false),
            'description' => $option['description'] ?? null,
            'group' => $option['group'] ?? null,
        ];
    })->values();

    $current = $name ? old($name, $selected) : $selected;
    $currentValues = collect(is_array($current) ? $current : ($current === null || $current === '' ? [] : [$current]))
        ->map(fn ($value) => (string) $value)
        ->values();

    $placeholder ??= __('my-eyes::ui.select.placeholder');
@endphp

<x-me::field :label="$label" :hint="$hint" :error="$error" :for="$id" :required="$required">
    <div
        class="me-select-field"
        data-me-select
        @if ($id) id="{{ $id }}" @endif
        data-name="{{ $name }}"
        data-multiple="{{ $multiple ? 'true' : 'false' }}"
        data-placeholder="{{ $placeholder }}"
        data-options="{{ $normalised->toJson(JSON_UNESCAPED_UNICODE) }}"
        data-selected="{{ $currentValues->toJson() }}"
        data-empty="{{ $currentValues->isEmpty() ? 'true' : 'false' }}"
        data-open="false"
    >
        <button
            type="button"
            {{ $attributes->class(['me-select-trigger']) }}
            data-me-select-trigger
            @if ($error) aria-invalid="true" @endif
        >
            <span class="me-select-trigger__value" data-me-select-value>{{ $placeholder }}</span>

            @if ($clearable)
                <span
                    class="me-select-clear"
                    data-me-select-clear
                    role="button"
                    tabindex="-1"
                    aria-label="{{ __('my-eyes::ui.select.clear') }}"
                >
                    <x-me::icon name="x" />
                </span>
            @endif

            <x-me::icon name="chevron-down" class="me-select-trigger__chevron" />
        </button>

        <div class="me-select-panel" data-me-select-panel>
            @if ($searchable)
                <div class="me-select-search">
                    <input
                        type="text"
                        class="me-input me-input--sm"
                        data-me-select-search
                        placeholder="{{ __('my-eyes::ui.select.search') }}"
                        aria-label="{{ __('my-eyes::ui.select.search') }}"
                        autocomplete="off"
                    />
                </div>
            @endif

            <ul class="me-select-list" role="listbox" data-me-select-list></ul>

            <p class="me-select__empty" data-me-select-empty hidden>
                {{ __('my-eyes::ui.select.empty') }}
            </p>
        </div>

        <div data-me-select-inputs></div>
    </div>
</x-me::field>
