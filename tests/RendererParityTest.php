<?php

declare(strict_types=1);

/**
 * Every Blade component has a Vue equivalent, and this is what proves it.
 *
 * Parity was claimed by hand once and was wrong — the check had been made
 * against the showcase, which does not demonstrate every component. Counting
 * the two sets is the only claim that cannot drift.
 */

/** Blade components with no meaning in a Vue application, and why. */
const NOT_APPLICABLE_TO_VUE = [
    // Emits <html>/<head> for a server-rendered page. A Vue application owns
    // its document, and Inertia owns the page shell.
    'layouts/head',
    // Emits the locale's strings as a JSON script tag for the browser to read.
    // Vue calls configureMessages() directly instead.
    'translations',
];

function bladeComponents(): array
{
    $root = __DIR__.'/../resources/views/components';

    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));

    $names = [];

    foreach ($files as $file) {
        if (! $file->isFile() || ! str_ends_with($file->getFilename(), '.blade.php')) {
            continue;
        }

        $name = str_replace([$root.'/', '.blade.php'], '', $file->getPathname());

        // The Livewire variants are alternative renderings of components that
        // already count, not components of their own.
        if (! str_starts_with($name, 'livewire/')) {
            $names[] = $name;
        }
    }

    sort($names);

    return $names;
}

function vueComponents(): array
{
    $source = (string) file_get_contents(__DIR__.'/../packages/vue/src/index.ts');

    preg_match_all('/\b(Me[A-Za-z]+)\b/', $source, $matches);

    $names = array_values(array_unique($matches[1]));
    sort($names);

    return $names;
}

/**
 * Blade names the file, Vue names the export. This maps one to the other for
 * the cases where they are not the same word.
 */
function expectedVueName(string $blade): string
{
    $special = [
        'dropdown/index' => 'MeDropdown',
        'layouts/admin' => 'MeAdminLayout',
        'layouts/auth' => 'MeAuthLayout',
        'layouts/error' => 'MeErrorLayout',
    ];

    if (isset($special[$blade])) {
        return $special[$blade];
    }

    return 'Me'.str($blade)->replace('/', '-')->studly()->toString();
}

it('exports a Vue component for every Blade component', function () {
    $missing = [];

    foreach (bladeComponents() as $blade) {
        if (in_array($blade, NOT_APPLICABLE_TO_VUE, true)) {
            continue;
        }

        $expected = expectedVueName($blade);

        if (! in_array($expected, vueComponents(), true)) {
            $missing[$blade] = $expected;
        }
    }

    expect($missing)->toBe([]);
});

it('counts the two sets, so neither can quietly outgrow the other', function () {
    $blade = count(bladeComponents()) - count(NOT_APPLICABLE_TO_VUE);

    expect(count(vueComponents()))->toBe($blade);
});

it('keeps the not-applicable list honest', function () {
    // A name listed as not applicable has to still exist; otherwise the list
    // is hiding a component that was renamed or deleted.
    foreach (NOT_APPLICABLE_TO_VUE as $name) {
        expect(bladeComponents())->toContain($name);
    }
});
