<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Illuminate\View\ViewException;

it('renders a button with variant and size classes', function () {
    $html = Blade::render('<x-me::button variant="primary" size="lg">Save</x-me::button>');

    expect($html)
        ->toContain('me-btn')
        ->toContain('me-btn--primary')
        ->toContain('me-btn--lg')
        ->toContain('type="button"')
        ->toContain('Save');
});

it('renders a button as a link when given an href', function () {
    $html = Blade::render('<x-me::button href="/orders">Orders</x-me::button>');

    expect($html)->toContain('<a')->toContain('href="/orders"');
});

it('squares an icon-only button', function () {
    $html = Blade::render('<x-me::button icon="plus" />');

    expect($html)->toContain('me-btn--icon');
});

it('keeps app utility classes alongside component classes', function () {
    $html = Blade::render('<x-me::button variant="primary" class="w-full" />');

    expect($html)->toContain('me-btn--primary')->toContain('w-full');
});

it('renders an input with its label and wiring', function () {
    $html = Blade::render('<x-me::input name="email" type="email" :label="\'Email\'" required />');

    expect($html)
        ->toContain('me-field')
        ->toContain('me-label--required')
        ->toContain('for="email"')
        ->toContain('id="email"')
        ->toContain('name="email"')
        ->toContain('type="email"')
        ->toContain('me-input');
});

it('pulls a validation error from the error bag', function () {
    $this->shareErrors('email', 'The email field is required.');

    $html = Blade::render('<x-me::input name="email" :label="\'Email\'" />');

    expect($html)
        ->toContain('aria-invalid="true"')
        ->toContain('me-error')
        ->toContain('The email field is required.');
});

it('adds a reveal toggle to password inputs', function () {
    $html = Blade::render('<x-me::input name="password" type="password" />');

    expect($html)
        ->toContain('me-input-group')
        ->toContain('data-me-password-toggle')
        ->toContain('me-reveal-show');
});

it('renders prefix and suffix addons inside a group', function () {
    $html = Blade::render('<x-me::input name="site" prefix="https://" suffix=".com" />');

    expect($html)
        ->toContain('me-input-group')
        ->toContain('https://')
        ->toContain('.com');
});

it('renders a numeric input with a formatted display and a raw hidden value', function () {
    $html = Blade::render('<x-me::numeric name="price" :value="1234.5" :decimals="2" :min="0" />');

    expect($html)
        ->toContain('data-me-numeric')
        ->toContain('data-decimals="2"')
        ->toContain('data-min="0"')
        ->toContain('data-me-numeric-display')
        ->toContain('data-me-numeric-value')
        // The name belongs to the hidden field, never the formatted one.
        ->toContain('name="price"')
        ->toContain('value="1234.5"')
        ->toContain('me-stepper');
});

it('marks the selected option in a select', function () {
    $html = Blade::render(
        '<x-me::select name="status" :options="$options" selected="paid" placeholder="Choose" />',
        ['options' => ['pending' => 'Pending', 'paid' => 'Paid']]
    );

    expect($html)
        ->toContain('me-select')
        ->toContain('Choose')
        // Whitespace between attributes varies with Blade's conditional output.
        ->toMatch('/<option value="paid"\s+selected/')
        ->not->toMatch('/<option value="pending"\s+selected/');
});

it('renders checkbox, radio and switch controls', function () {
    expect(Blade::render('<x-me::checkbox name="terms" :label="\'Accept\'" />'))
        ->toContain('me-check')
        ->toContain('type="checkbox"');

    expect(Blade::render('<x-me::radio name="plan" value="pro" :label="\'Pro\'" />'))
        ->toContain('me-radio')
        ->toContain('id="plan_pro"');

    expect(Blade::render('<x-me::switch name="notify" :label="\'Notify\'" checked />'))
        ->toContain('me-switch__track')
        ->toContain('role="switch"')
        ->toContain('checked');
});

it('renders an upload dropzone with its constraints', function () {
    $html = Blade::render('<x-me::upload name="docs" accept=".pdf" :max-size="1048576" multiple />');

    expect($html)
        ->toContain('data-me-upload')
        ->toContain('data-max-size="1048576"')
        ->toContain('accept=".pdf"')
        ->toContain('name="docs[]"')
        ->toContain('data-me-upload-list');
});

it('renders alerts and badges with role colours', function () {
    expect(Blade::render('<x-me::alert variant="danger" dismissible>Boom</x-me::alert>'))
        ->toContain('me-alert--danger')
        ->toContain('data-me-dismiss')
        ->toContain('role="alert"');

    expect(Blade::render('<x-me::badge variant="success">Paid</x-me::badge>'))
        ->toContain('me-badge--success');
});

it('derives avatar initials from a name', function () {
    expect(Blade::render('<x-me::avatar name="Márcio Elias" />'))->toContain('ME');
    expect(Blade::render('<x-me::avatar name="Ana" />'))->toContain('AN');
});

it('renders a dropdown with trigger and panel hooks', function () {
    $html = Blade::render(<<<'BLADE'
        <x-me::dropdown>
            <x-slot:trigger><button>Open</button></x-slot:trigger>
            <x-me::dropdown.item href="/profile" icon="user">Profile</x-me::dropdown.item>
            <x-me::dropdown.divider />
        </x-me::dropdown>
    BLADE);

    expect($html)
        ->toContain('data-me-dropdown')
        ->toContain('data-me-dropdown-trigger')
        ->toContain('data-me-dropdown-panel')
        ->toContain('me-dropdown__item')
        ->toContain('role="menuitem"')
        ->toContain('me-dropdown__divider');
});

it('marks the active nav item and nests submenus in valid markup', function () {
    $html = Blade::render(<<<'BLADE'
        <x-me::nav.section title="Main">
            <x-me::nav.item href="/here" icon="home" :active="true">Here</x-me::nav.item>
            <x-me::nav.group label="Settings" icon="settings">
                <x-me::nav.subitem href="/general">General</x-me::nav.subitem>
            </x-me::nav.group>
        </x-me::nav.section>
    BLADE);

    expect($html)
        ->toContain('aria-current="page"')
        ->toContain('data-me-nav-group')
        ->toContain('data-me-nav-trigger')
        ->toContain('me-nav__submenu-inner')
        // The list must contain list items, not divs.
        ->toContain('<li>');
});

it('renders an icon from the bundled set', function () {
    $html = Blade::render('<x-me::icon name="chevron-down" />');

    expect($html)->toContain('<svg')->toContain('m6 9 6 6 6-6');
});

it('renders slot geometry in the standard icon wrapper', function () {
    $html = Blade::render('<x-me::icon><path d="M4 20h16" /></x-me::icon>');

    expect($html)
        ->toContain('viewBox="0 0 24 24"')
        ->toContain('stroke-linecap="round"')
        ->toContain('M4 20h16');
});

it('lets a slotted icon override the looked-up name', function () {
    $html = Blade::render('<x-me::icon name="check"><path d="M1 1h1" /></x-me::icon>');

    expect($html)->toContain('M1 1h1')->not->toContain('M20 6 9 17l-5-5');
});

it('refuses an unknown icon name while debugging', function () {
    config()->set('app.debug', true);

    // Blade wraps whatever a view throws, so the type is not the assertion —
    // the message reaching the developer is.
    Blade::render('<x-me::icon name="definitely-not-an-icon" />');
})->throws(ViewException::class, 'Unknown my-eyes icon [definitely-not-an-icon]');

it('degrades quietly on an unknown icon in production', function () {
    config()->set('app.debug', false);

    // A missing glyph must not take a page down.
    expect(Blade::render('<x-me::icon name="definitely-not-an-icon" />'))->toContain('<svg');
});

it('accepts an icon registered through config', function () {
    config()->set('my-eyes.icons', ['invoice' => '<path d="M6 3h12v18" />']);

    expect(Blade::render('<x-me::icon name="invoice" />'))->toContain('M6 3h12v18');
});
