<x-me::layouts.auth
    :heading="__('my-eyes::auth.forgot.heading')"
    :subheading="__('my-eyes::auth.forgot.subheading')"
>
    <form method="POST" action="{{ route('password.email') }}" class="me-stack">
        @csrf

        <x-me::input
            name="email"
            type="email"
            :label="__('my-eyes::auth.fields.email')"
            autocomplete="username"
            required
            autofocus
        />

        <x-me::button type="submit" variant="primary" block>
            {{ __('my-eyes::auth.forgot.submit') }}
        </x-me::button>
    </form>

    <x-slot:footer>
        <a href="{{ route('login') }}" class="me-btn me-btn--link me-btn--sm">{{ __('my-eyes::auth.forgot.back') }}</a>
    </x-slot:footer>
</x-me::layouts.auth>
