@props([
    'align' => 'end',
    'sheet' => true,
    'trigger' => null,
])

{{--
    Anchored menu. "sheet" pins the panel to the bottom of the viewport on
    phones, where a menu hanging off the top bar is hard to reach one-handed.
--}}

<div {{ $attributes->class(['me-dropdown']) }} data-me-dropdown data-open="false">
    <div data-me-dropdown-trigger>{{ $trigger }}</div>

    <div
        @class([
            'me-dropdown__panel',
            'me-dropdown__panel--start' => $align === 'start',
            'me-dropdown__panel--sheet' => $sheet,
        ])
        data-me-dropdown-panel
        role="menu"
    >
        {{ $slot }}
    </div>
</div>
