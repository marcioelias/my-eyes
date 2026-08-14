<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;

it('renders a determinate progress bar with accessible values', function () {
    $html = Blade::render('<x-me::progress :value="72" variant="success" label="Uploading" show-value />');

    expect($html)
        ->toContain('me-progress')
        ->toContain('me-progress--success')
        ->toContain('role="progressbar"')
        ->toContain('aria-valuenow="72"')
        ->toContain('--me-progress: 72%')
        ->toContain('Uploading')
        ->toContain('72%');
});

it('renders an indeterminate bar without a value', function () {
    $html = Blade::render('<x-me::progress variant="primary" />');

    expect($html)
        ->toContain('me-progress--indeterminate')
        ->not->toContain('aria-valuenow');
});

it('clamps a progress value that overflows its max', function () {
    expect(Blade::render('<x-me::progress :value="150" />'))->toContain('--me-progress: 100%');
    expect(Blade::render('<x-me::progress :value="-20" />'))->toContain('--me-progress: 0%');
});

it('scales progress against a custom max', function () {
    expect(Blade::render('<x-me::progress :value="25" :max="50" show-value />'))
        ->toContain('--me-progress: 50%')
        ->toContain('50%');
});

it('renders a progress ring', function () {
    $html = Blade::render('<x-me::progress-ring :value="64" variant="warning" size="lg" />');

    expect($html)
        ->toContain('me-progress-ring')
        ->toContain('me-progress-ring--warning')
        ->toContain('me-progress-ring--lg')
        ->toContain('--me-progress: 64%')
        ->toContain('64%');
});

it('renders a tooltip trigger with placement and text', function () {
    $html = Blade::render(<<<'BLADE'
        <x-me::tooltip text="Delete order" placement="bottom">
            <button>x</button>
        </x-me::tooltip>
    BLADE);

    expect($html)
        ->toContain('me-tooltip-trigger')
        ->toContain('data-me-tooltip="Delete order"')
        ->toContain('data-tooltip-placement="bottom"')
        ->toContain('<button>x</button>');
});

it('renders the toast container at the requested position', function () {
    $html = Blade::render('<x-me::toasts position="bottom-center" />');

    expect($html)
        ->toContain('me-toasts')
        ->toContain('data-position="bottom-center"')
        ->toContain('aria-live="polite"');
});

it('turns flashed shorthand messages into toast payloads', function () {
    session()->flash('success', 'Order created');

    $html = Blade::render('<x-me::toasts />');

    expect($html)
        ->toContain('data-me-toast')
        ->toContain('data-variant="success"')
        ->toContain('data-text="Order created"');
});

it('accepts an explicit toast payload with title and duration', function () {
    session()->flash('toast', [
        'variant' => 'danger',
        'title' => 'Upload failed',
        'text' => 'The file was rejected',
        'duration' => 0,
    ]);

    $html = Blade::render('<x-me::toasts />');

    expect($html)
        ->toContain('data-variant="danger"')
        ->toContain('data-title="Upload failed"')
        // A duration of zero means it stays until dismissed.
        ->toContain('data-duration="0"');
});

it('renders no toast payload when nothing was flashed', function () {
    $html = Blade::render('<x-me::toasts />');

    expect($html)->toContain('me-toasts')->not->toContain('data-me-toast');
});

it('marks a static modal so it cannot be dismissed by escape or backdrop', function () {
    $html = Blade::render('<x-me::modal id="locked" title="Decide" confirm="Yes" cancel="No" static />');

    expect($html)->toContain('data-me-modal-static="true"');
});

it('leaves ordinary modals dismissible', function () {
    $html = Blade::render('<x-me::modal id="normal" title="Hi" confirm="OK" />');

    expect($html)->not->toContain('data-me-modal-static');
});
