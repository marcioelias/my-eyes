<?php

declare(strict_types=1);

use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;
use MyEyes\Support\FileSize;

beforeEach(function () {
    // The layouts pull in the app's Vite entrypoints, which have no manifest here.
    $this->withoutVite();
});

it('renders the admin shell with its mobile and desktop hooks', function () {
    $html = Blade::render(<<<'BLADE'
        <x-me::layouts.admin heading="Dashboard" subheading="Overview">
            <x-slot:nav>
                <x-me::nav.item href="/dashboard" icon="home">Dashboard</x-me::nav.item>
            </x-slot:nav>
            <p>Body</p>
        </x-me::layouts.admin>
    BLADE);

    expect($html)
        ->toContain('<!DOCTYPE html>')
        ->toContain('me-shell')
        ->toContain('data-me-shell')
        // Drawer state and collapsed state are both initialised.
        ->toContain('data-sidebar-open="false"')
        ->toContain('data-sidebar-collapsed="false"')
        ->toContain('data-me-sidebar-toggle')
        ->toContain('data-me-sidebar-close')
        ->toContain('data-me-sidebar-collapse')
        ->toContain('me-topbar')
        ->toContain('me-skip-link')
        ->toContain('id="me-main"')
        ->toContain('Dashboard')
        ->toContain('Overview')
        ->toContain('<p>Body</p>');
});

it('applies the stored theme before the stylesheet to avoid a flash', function () {
    $html = Blade::render('<x-me::layouts.admin>x</x-me::layouts.admin>');

    expect($html)
        ->toContain("localStorage.getItem('my-eyes:theme')")
        ->toContain('data-me-theme');

    // The boot script must come before anything that paints.
    expect(strpos($html, 'my-eyes:theme'))->toBeLessThan((int) strpos($html, '</head>'));
});

it('renders the footer only when enabled', function () {
    expect(Blade::render('<x-me::layouts.admin>x</x-me::layouts.admin>'))->toContain('me-footer');

    config()->set('my-eyes.layout.footer', false);

    expect(Blade::render('<x-me::layouts.admin>x</x-me::layouts.admin>'))->not->toContain('me-footer');
});

it('renders the auth layout', function () {
    $html = Blade::render('<x-me::layouts.auth heading="Sign in">form</x-me::layouts.auth>');

    expect($html)
        ->toContain('me-auth')
        ->toContain('me-auth__panel')
        ->toContain('Sign in')
        ->toContain('me-card');
});

it('splits the auth layout in two halves by default', function () {
    $html = Blade::render('<x-me::layouts.auth heading="Sign in">form</x-me::layouts.auth>');

    expect($html)
        ->toContain('me-auth--split')
        ->toContain('me-auth__aside')
        // With no tagline the brand name fills the visual half, so it is never
        // an empty panel.
        ->toContain('me-auth__tagline');
});

it('takes a photograph on the visual half', function () {
    $html = Blade::render('<x-me::layouts.auth image="/img/login.jpg" tagline="One place">form</x-me::layouts.auth>');

    expect($html)
        ->toContain('me-auth__image')
        ->toContain('src="/img/login.jpg"')
        // Decorative: the screen already says what the image says.
        ->toContain('alt=""')
        ->toContain('One place');
});

it('flips the halves without moving the form in the DOM', function () {
    $html = Blade::render('<x-me::layouts.auth reverse>form</x-me::layouts.auth>');

    expect($html)->toContain('me-auth--reverse');

    // The form column still comes first; only CSS order changes.
    expect(strpos($html, 'me-auth__main'))->toBeLessThan((int) strpos($html, 'me-auth__aside'));
});

it('gives the single centred column back when asked', function () {
    $html = Blade::render('<x-me::layouts.auth :split="false" reverse>form</x-me::layouts.auth>');

    expect($html)
        ->not->toContain('me-auth--split')
        ->not->toContain('me-auth--reverse')
        ->not->toContain('me-auth__aside')
        ->toContain('me-auth__panel');
});

it('replaces the visual half content through the aside slot', function () {
    $html = Blade::render(<<<'BLADE'
        <x-me::layouts.auth>
            <x-slot:aside>
                <p class="me-auth__aside-text">Trusted by teams</p>
            </x-slot:aside>

            form
        </x-me::layouts.auth>
        BLADE);

    expect($html)
        ->toContain('Trusted by teams')
        ->not->toContain('me-auth__tagline');
});

it('colours error pages by severity', function () {
    expect(Blade::render('<x-me::layouts.error status="404" title="Not found">missing</x-me::layouts.error>'))
        ->toContain('me-error-page--warning')
        ->toContain('404');

    expect(Blade::render('<x-me::layouts.error status="500" title="Boom">broke</x-me::layouts.error>'))
        ->toContain('me-error-page--danger');
});

it('renders every bundled error view', function (string $status) {
    $html = view("my-eyes::errors.{$status}")->render();

    expect($html)->toContain('me-error-page')->toContain($status);
})->with(['401', '403', '404', '419', '429', '500', '503']);

it('renders the starter kit auth pages', function (string $page) {
    // The published views target these conventional Laravel route names.
    collect(['login', 'register', 'password.request', 'password.email', 'password.store', 'password.confirm', 'verification.send', 'logout'])
        ->each(fn (string $name) => Route::get("/{$name}", fn () => '')->name($name));

    $html = view("my-eyes::pages.auth.{$page}", [
        'request' => request()->merge(['email' => 'user@example.com']),
    ])->render();

    expect($html)->toContain('me-auth')->toContain('<form');
})->with(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'confirm-password']);

it('renders the dashboard and profile pages once published', function (string $page) {
    /*
     * These two @include the navigation partial by its published name, so the
     * test resolves views the way an application would after publishing.
     */
    View::addLocation(__DIR__.'/../resources/views/pages');

    collect(['dashboard', 'profile.edit', 'profile.update', 'profile.destroy', 'password.update', 'verification.send', 'logout'])
        ->each(fn (string $name) => Route::get('/'.str_replace('.', '/', $name), fn () => '')->name($name));

    $user = new class extends User
    {
        protected $attributes = ['name' => 'Márcio Elias', 'email' => 'marcio@example.com'];
    };

    $this->actingAs($user);

    $html = view($page, ['user' => $user])->render();

    expect($html)->toContain('me-shell')->toContain('me-nav__item');
})->with(['dashboard', 'profile.edit']);

it('formats file sizes without the intl extension', function () {
    expect(FileSize::format(0))->toBe('0 B');
    expect(FileSize::format(512))->toBe('512 B');
    expect(FileSize::format(1024))->toBe('1 KB');
    expect(FileSize::format(1_048_576))->toBe('1 MB');
    expect(FileSize::format(1_572_864))->toBe('1.5 MB');
});
