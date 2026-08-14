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
</x-me::layouts.auth>
