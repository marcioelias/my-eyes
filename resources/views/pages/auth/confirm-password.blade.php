<x-me::layouts.auth
    :heading="__('my-eyes::auth.confirm.heading')"
    :subheading="__('my-eyes::auth.confirm.subheading')"
>
    <form method="POST" action="{{ route('password.confirm') }}" class="me-stack">
        @csrf

        <x-me::input
            name="password"
            type="password"
            :label="__('my-eyes::auth.fields.password')"
            autocomplete="current-password"
            required
            autofocus
        />

        <x-me::button type="submit" variant="primary" block>
            {{ __('my-eyes::auth.confirm.submit') }}
        </x-me::button>
    </form>

    <div class="me-stack" data-me-passkey-only hidden>
        <p class="me-auth__separator">{{ __('my-eyes::auth.login.or') }}</p>

        <x-me::button type="button" variant="secondary" block icon="key" data-me-passkey="confirm">
            {{ __('my-eyes::auth.passkeys.confirm') }}
        </x-me::button>

        <p class="me-error" data-me-passkey-error hidden></p>
    </div>
</x-me::layouts.auth>
