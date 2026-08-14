@props(['size' => 'md'])

{{--
    Cycles the three colour modes: system → light → dark → system.

    "System" follows the operating system's preference and is the default, so a
    visitor who has never touched the control gets whatever their OS asks for.
    It stays in the cycle rather than being buried in settings, so someone who
    picked light or dark can hand control back without clearing site data.

    The icon shows the mode that is *selected* — a monitor for system — which is
    decided by CSS from the data-theme attribute, not by JavaScript.

    For an explicit three-option control instead of a cycle, use
    <x-me::theme-menu />, or build your own with data-me-theme="light|dark|system".
--}}

<button
    type="button"
    {{ $attributes->class(['me-btn', 'me-btn--ghost', 'me-btn--icon', "me-btn--{$size}"]) }}
    data-me-theme
    aria-label="{{ __('my-eyes::ui.layout.toggle_theme') }}"
>
    <x-me::icon name="monitor" class="me-theme-icon-system" />
    <x-me::icon name="sun" class="me-theme-icon-light" />
    <x-me::icon name="moon" class="me-theme-icon-dark" />
</button>
