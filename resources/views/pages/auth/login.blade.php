<x-me::layouts.auth
    :heading="__('my-eyes::auth.login.heading')"
    :subheading="__('my-eyes::auth.login.subheading')"
>
    <form method="POST" action="{{ route('login') }}" class="me-stack">
        @csrf

        <x-me::input
            name="email"
            type="email"
            :label="__('my-eyes::auth.fields.email')"
            autocomplete="username"
            required
            autofocus
        />

        <x-me::input
            name="password"
            type="password"
            :label="__('my-eyes::auth.fields.password')"
            autocomplete="current-password"
            required
        />

        <div class="me-row me-row--between">
            <x-me::checkbox name="remember" :label="__('my-eyes::auth.login.remember')" />

            @if (Route::has('password.request'))
                <a href="{{ route('password.request') }}" class="me-btn me-btn--link me-btn--sm">
                    {{ __('my-eyes::auth.login.forgot') }}
                </a>
            @endif
        </div>

        <x-me::button type="submit" variant="primary" block>
            {{ __('my-eyes::auth.login.heading') }}
        </x-me::button>
    </form>

    {{--
        Hidden until the binding confirms the browser can do WebAuthn: a
        server-rendered page cannot feature-detect, and an affordance that
        cannot work must not be offered.
    --}}
    <div class="me-stack" data-me-passkey-only hidden>
        <p class="me-auth__separator">{{ __('my-eyes::auth.login.or') }}</p>

        <x-me::button type="button" variant="secondary" block icon="key" data-me-passkey="login">
            {{ __('my-eyes::auth.passkeys.sign_in') }}
        </x-me::button>

        <p class="me-error" data-me-passkey-error hidden></p>
    </div>

    @if (Route::has('register'))
        <x-slot:footer>
            {{ __('my-eyes::auth.login.no_account') }}
            <a href="{{ route('register') }}" class="me-btn me-btn--link me-btn--sm">{{ __('my-eyes::auth.login.sign_up') }}</a>
        </x-slot:footer>
    @endif
</x-me::layouts.auth>
