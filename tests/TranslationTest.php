<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use MyEyes\Support\Messages;

it('renders component strings in English by default', function () {
    $this->withoutVite();

    expect(Blade::render('<x-me::input name="password" type="password" />'))
        ->toContain('Show password');

    expect(Blade::render('<x-me::layouts.admin>x</x-me::layouts.admin>'))
        ->toContain('Skip to content');
});

it('renders component strings in pt_BR when the locale switches', function () {
    app()->setLocale('pt_BR');

    expect(Blade::render('<x-me::input name="password" type="password" />'))
        ->toContain('Mostrar senha');

    // No confirm label given, so the component falls back to its own string.
    expect(Blade::render('<x-me::modal id="m" />'))
        ->toContain('OK');

    expect(Blade::render('<x-me::alert variant="danger" dismissible>x</x-me::alert>'))
        ->toContain('Dispensar');
});

it('translates the starter kit pages', function () {
    $this->withoutVite();

    app()->setLocale('pt_BR');

    collect(['login', 'password.request', 'register'])
        ->each(fn (string $name) => Route::get("/{$name}", fn () => '')->name($name));

    $html = view('my-eyes::pages.auth.login')->render();

    expect($html)
        ->toContain('Entrar')
        ->toContain('Lembrar de mim')
        ->toContain('Esqueceu a senha?');
});

it('translates error pages', function () {
    $this->withoutVite();

    app()->setLocale('pt_BR');

    expect(view('my-eyes::errors.404')->render())
        ->toContain('Página não encontrada')
        ->toContain('Voltar');
});

it('translates the table and filter chrome', function () {
    app()->setLocale('pt_BR');

    expect(__('my-eyes::filters.ui.title'))->toBe('Filtros');
    expect(__('my-eyes::filters.operators.contains'))->toBe('contém');
    expect(__('my-eyes::filters.table.per_page'))->toBe('Por página');
});

it('exposes the javascript messages for the current locale', function () {
    $english = Messages::forJavaScript();

    expect($english)
        ->toHaveKey('toast.close')
        ->toHaveKey('upload.tooLarge')
        ->toHaveKey('filters.where');

    expect($english['toast.close'])->toBe('Close');

    app()->setLocale('pt_BR');

    $portuguese = Messages::forJavaScript();

    expect($portuguese['toast.close'])->toBe('Fechar');
    expect($portuguese['password.show'])->toBe('Mostrar senha');
    // Placeholders must survive translation — the JS substitutes them.
    expect($portuguese['upload.tooLarge'])->toContain(':name')->toContain(':limit');
});

it('emits the messages as json for the javascript layer', function () {
    app()->setLocale('pt_BR');

    $html = Blade::render('<x-me::translations />');

    expect($html)->toContain('data-me-messages');

    preg_match('/data-me-messages>(.*?)<\/script>/s', $html, $matches);
    $decoded = json_decode(html_entity_decode($matches[1] ?? '{}'), true);

    expect($decoded)->toBeArray();
    expect($decoded['toast.close'])->toBe('Fechar');
});

it('includes the translations payload in the bundled layouts', function () {
    $this->withoutVite();

    expect(Blade::render('<x-me::layouts.auth>x</x-me::layouts.auth>'))
        ->toContain('data-me-messages');
});

it('keeps every javascript message key in sync with the core dictionary', function () {
    // The TypeScript dictionary is the contract; a key missing on either side
    // means a string silently falls back to English at runtime.
    $source = file_get_contents(__DIR__.'/../packages/core/src/headless/i18n.ts');

    preg_match_all("/^    '([a-zA-Z.]+)':/m", (string) $source, $matches);

    $coreKeys = $matches[1];
    $phpKeys = array_keys(Messages::forJavaScript());

    sort($coreKeys);
    sort($phpKeys);

    expect($phpKeys)->toBe($coreKeys);
});

it('keeps the generated icon files in step with resources/icons', function () {
    // The set is generated into PHP and TypeScript from one directory of SVGs.
    // Editing a generated file by hand, or adding an SVG without running the
    // generator, is what this catches.
    $process = proc_open(
        [PHP_BINARY, __DIR__.'/../bin/build-icons.php', '--check'],
        [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
        $pipes
    );

    $output = stream_get_contents($pipes[1]).stream_get_contents($pipes[2]);
    array_map('fclose', $pipes);

    expect(proc_close($process))->toBe(0, $output);
});
