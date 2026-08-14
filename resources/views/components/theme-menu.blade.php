@props(['align' => 'end'])

{{--
    Explicit three-option colour mode picker, for a settings page or a place
    where a cycling button would be too opaque.

    Each item sets one mode through data-me-theme; the binding marks the active
    one with aria-pressed. System is the default and means "follow the operating
    system", so it is listed first.
--}}

<x-me::dropdown :align="$align" {{ $attributes }}>
    <x-slot:trigger>
        <button type="button" class="me-btn me-btn--secondary me-btn--sm">
            <x-me::icon name="monitor" class="me-theme-icon-system" />
            <x-me::icon name="sun" class="me-theme-icon-light" />
            <x-me::icon name="moon" class="me-theme-icon-dark" />
            <span>{{ __('my-eyes::ui.theme.theme') }}</span>
        </button>
    </x-slot:trigger>

    <button type="button" class="me-dropdown__item" data-me-theme="system" data-me-keep-open>
        <x-me::icon name="monitor" />
        {{ __('my-eyes::ui.theme.system') }}
    </button>

    <button type="button" class="me-dropdown__item" data-me-theme="light" data-me-keep-open>
        <x-me::icon name="sun" />
        {{ __('my-eyes::ui.theme.light') }}
    </button>

    <button type="button" class="me-dropdown__item" data-me-theme="dark" data-me-keep-open>
        <x-me::icon name="moon" />
        {{ __('my-eyes::ui.theme.dark') }}
    </button>
</x-me::dropdown>
