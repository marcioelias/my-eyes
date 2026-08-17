<?php

declare(strict_types=1);

/**
 * Every Blade component has a Vue equivalent, and every published Blade screen
 * has a Vue screen. This is what proves both.
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

/** Published Blade pages that are examples of an application's own screens. */
const PAGES_NOT_APPLICABLE_TO_VUE = [
    // A starting point for the application's own dashboard, not authentication.
    'dashboard',
    // Example navigation: every item is the application's own route.
    'partials/navigation',
    // The admin shell around the profile cards. MeAdminLayout is that shell,
    // and it already counts as a component.
    'profile/edit',
];

/** Blade page to Vue screen. Every other page is expected to have one. */
const PAGE_TO_VUE_SCREEN = [
    'auth/confirm-password' => 'MeConfirmPasswordScreen',
    'auth/forgot-password' => 'MeForgotPasswordScreen',
    'auth/login' => 'MeLoginScreen',
    'auth/register' => 'MeRegisterScreen',
    'auth/reset-password' => 'MeResetPasswordScreen',
    'auth/two-factor-challenge' => 'MeTwoFactorChallengeScreen',
    'auth/verify-email' => 'MeVerifyEmailScreen',
    'profile/partials/delete-user' => 'MeDeleteAccountCard',
    'profile/partials/passkeys' => 'MePasskeysCard',
    'profile/partials/two-factor' => 'MeTwoFactorCard',
    'profile/partials/update-password' => 'MeUpdatePasswordCard',
    'profile/partials/update-profile-information' => 'MeProfileInformationCard',
];

/**
 * @return array<int, string>
 */
function bladeNames(string $directory, string $skipPrefix = ''): array
{
    $root = __DIR__.'/../resources/views/'.$directory;

    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));

    $names = [];

    foreach ($files as $file) {
        if (! $file->isFile() || ! str_ends_with($file->getFilename(), '.blade.php')) {
            continue;
        }

        $name = str_replace([$root.'/', '.blade.php'], '', $file->getPathname());

        if ($skipPrefix !== '' && str_starts_with($name, $skipPrefix)) {
            continue;
        }

        $names[] = $name;
    }

    sort($names);

    return $names;
}

/**
 * @return array<int, string>
 */
function bladeComponents(): array
{
    // The Livewire variants are alternative renderings of components that
    // already count, not components of their own.
    return bladeNames('components', 'livewire/');
}

/**
 * @return array<int, string>
 */
function bladePages(): array
{
    return bladeNames('pages');
}

/**
 * Exported names, grouped by the module they come from — screens live in their
 * own module precisely so they can be counted separately.
 *
 * @return array<string, array<int, string>>
 */
function vueExports(): array
{
    $source = (string) file_get_contents(__DIR__.'/../packages/vue/src/index.ts');

    preg_match_all('/export\s*\{(.+?)\}\s*from\s*\'\.\/([\w.-]+)\.js\'/s', $source, $matches, PREG_SET_ORDER);

    $modules = [];

    foreach ($matches as $match) {
        preg_match_all('/\b(Me[A-Za-z]+)\b/', $match[1], $names);

        $module = $match[2];
        $modules[$module] = array_values(array_unique(array_merge($modules[$module] ?? [], $names[1])));
    }

    return $modules;
}

/**
 * @return array<int, string>
 */
function vueComponents(): array
{
    $names = [];

    foreach (vueExports() as $module => $exports) {
        if ($module !== 'screens') {
            $names = array_merge($names, $exports);
        }
    }

    $names = array_values(array_unique($names));
    sort($names);

    return $names;
}

/**
 * @return array<int, string>
 */
function vueScreens(): array
{
    $names = vueExports()['screens'] ?? [];
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

    foreach (PAGES_NOT_APPLICABLE_TO_VUE as $name) {
        expect(bladePages())->toContain($name);
    }
});

it('exports a Vue screen for every published Blade screen', function () {
    $missing = [];

    foreach (bladePages() as $page) {
        if (in_array($page, PAGES_NOT_APPLICABLE_TO_VUE, true)) {
            continue;
        }

        $expected = PAGE_TO_VUE_SCREEN[$page] ?? null;

        if ($expected === null || ! in_array($expected, vueScreens(), true)) {
            $missing[$page] = $expected ?? '(unmapped)';
        }
    }

    expect($missing)->toBe([]);
});

it('counts the screens too', function () {
    $pages = count(bladePages()) - count(PAGES_NOT_APPLICABLE_TO_VUE);

    expect(count(vueScreens()))->toBe($pages);
});
