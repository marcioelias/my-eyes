<x-me::layouts.auth
    :heading="__('my-eyes::auth.register.heading')"
    :subheading="__('my-eyes::auth.register.subheading')"
>
    <form method="POST" action="{{ route('register') }}" class="me-stack">
        @csrf

        <x-me::input
            name="name"
            :label="__('my-eyes::auth.fields.name')"
            autocomplete="name"
            required
            autofocus
        />

        <x-me::input
            name="email"
            type="email"
            :label="__('my-eyes::auth.fields.email')"
            autocomplete="username"
            required
        />

        <x-me::input
            name="password"
            type="password"
            :label="__('my-eyes::auth.fields.password')"
            autocomplete="new-password"
            required
        />

        <x-me::input
            name="password_confirmation"
            type="password"
            :label="__('my-eyes::auth.fields.confirm_password')"
            autocomplete="new-password"
            required
        />

        <x-me::button type="submit" variant="primary" block>
            {{ __('my-eyes::auth.register.submit') }}
        </x-me::button>
    </form>

    <x-slot:footer>
        {{ __('my-eyes::auth.register.have_account') }}
        <a href="{{ route('login') }}" class="me-btn me-btn--link me-btn--sm">{{ __('my-eyes::auth.login.heading') }}</a>
    </x-slot:footer>
</x-me::layouts.auth>
