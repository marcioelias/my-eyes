<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/**
 * The published authentication screens.
 *
 * These are views, so what is worth asserting is what the markup promises the
 * behaviour layer: the passkey hooks, the two-factor state the page is in, and
 * the field names Fortify distinguishes flows by.
 *
 * @see docs/features/auth-screens.md
 */

/** A stand-in for the application's user, with only what the screens read. */
function fakeUser(bool $enabled = false, bool $confirmed = false): object
{
    return new class($enabled, $confirmed)
    {
        public ?string $two_factor_secret;

        public ?string $two_factor_confirmed_at;

        public string $name = 'Márcio Elias';

        public string $email = 'marcio@example.com';

        public ?string $avatar_url = null;

        public function __construct(bool $enabled, bool $confirmed)
        {
            $this->two_factor_secret = $enabled ? 'SECRET' : null;
            $this->two_factor_confirmed_at = $confirmed ? '2026-08-17 00:00:00' : null;
        }

        public function twoFactorQrCodeSvg(): string
        {
            return '<svg data-qr></svg>';
        }

        public function twoFactorSecret(): string
        {
            return 'JBSWY3DPEHPK3PXP';
        }

        /** @return array<int, string> */
        public function recoveryCodes(): array
        {
            return ['aaaa-bbbb', 'cccc-dddd'];
        }
    };
}

beforeEach(function () {
    $this->withoutVite();

    collect(['login', 'password.request', 'register', 'profile.update', 'profile.destroy', 'password.update', 'verification.send', 'logout', 'password.confirm'])
        ->each(fn (string $name) => Route::get("/{$name}", fn () => '')->name($name));
});

it('offers a passkey on the sign-in screen, hidden until the browser confirms support', function () {
    $html = view('my-eyes::pages.auth.login')->render();

    expect($html)
        ->toContain('data-me-passkey="login"')
        ->toContain('data-me-passkey-only')
        // AC-01: the affordance ships hidden, and only the binding reveals it.
        ->toContain('hidden')
        ->toContain('data-me-passkey-error');
});

it('offers a passkey on the password confirmation screen', function () {
    expect(view('my-eyes::pages.auth.confirm-password')->render())
        ->toContain('data-me-passkey="confirm"');
});

it('asks for an authentication code, and only that field', function () {
    $html = view('my-eyes::pages.auth.two-factor-challenge')->render();

    // AC-06: Fortify tells the flows apart by field name, so only one is sent.
    expect($html)
        ->toContain('name="code"')
        ->not->toContain('name="recovery_code"');
});

it('swaps to the recovery code field, and only that one', function () {
    request()->merge(['recovery' => 1]);

    $html = view('my-eyes::pages.auth.two-factor-challenge')->render();

    expect($html)
        ->toContain('name="recovery_code"')
        ->not->toContain('name="code"');
});

it('offers to enable two-factor when it is off', function () {
    $html = view('my-eyes::pages.profile.partials.two-factor', ['user' => fakeUser()])->render();

    expect($html)
        ->toContain('/user/two-factor-authentication')
        ->not->toContain('data-qr')
        ->not->toContain('aaaa-bbbb');
});

it('shows the QR code and the confirmation field while two-factor is pending', function () {
    $html = view('my-eyes::pages.profile.partials.two-factor', ['user' => fakeUser(enabled: true)])->render();

    // AC-04
    expect($html)
        ->toContain('data-qr')
        ->toContain('JBSWY3DPEHPK3PXP')
        ->toContain('/user/confirmed-two-factor-authentication')
        ->not->toContain('aaaa-bbbb');
});

it('shows the recovery codes once two-factor is confirmed', function () {
    $html = view('my-eyes::pages.profile.partials.two-factor', [
        'user' => fakeUser(enabled: true, confirmed: true),
    ])->render();

    // AC-05
    expect($html)
        ->toContain('aaaa-bbbb')
        ->toContain('/user/two-factor-recovery-codes')
        ->not->toContain('data-qr');
});

it('lists passkeys and hides the whole card without WebAuthn', function () {
    $passkeys = [(object) ['id' => 7, 'name' => 'Work laptop', 'last_used_at' => null]];

    $html = view('my-eyes::pages.profile.partials.passkeys', [
        'user' => fakeUser(),
        'passkeys' => $passkeys,
    ])->render();

    expect($html)
        ->toContain('data-me-passkey-only')
        ->toContain('Work laptop')
        ->toContain('data-me-passkey="register"')
        ->toContain('/user/passkeys/7');
});

it('takes an avatar on the profile screen', function () {
    $html = view('my-eyes::pages.profile.partials.update-profile-information', ['user' => fakeUser()])->render();

    // AC-09: the field is a plain file input, and the package stores nothing.
    expect($html)
        ->toContain('enctype="multipart/form-data"')
        ->toContain('name="avatar"')
        ->toContain('me-avatar');
});
