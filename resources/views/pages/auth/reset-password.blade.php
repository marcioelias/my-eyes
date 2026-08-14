<x-me::layouts.auth
    :heading="__('my-eyes::auth.reset.heading')"
    :subheading="__('my-eyes::auth.reset.subheading')"
>
    <form method="POST" action="{{ route('password.store') }}" class="me-stack">
        @csrf

        <input type="hidden" name="token" value="{{ $request->route('token') }}" />

        <x-me::input
            name="email"
            type="email"
            :label="__('my-eyes::auth.fields.email')"
            :value="old('email', $request->email)"
            autocomplete="username"
            required
            autofocus
        />

        <x-me::input
            name="password"
            type="password"
            :label="__('my-eyes::auth.fields.new_password')"
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
            {{ __('my-eyes::auth.reset.submit') }}
        </x-me::button>
    </form>
</x-me::layouts.auth>
