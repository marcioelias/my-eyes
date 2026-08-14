<x-me::layouts.auth
    :heading="__('my-eyes::auth.verify.heading')"
    :subheading="__('my-eyes::auth.verify.subheading')"
>
    <div class="me-stack">
        @if (session('status') === 'verification-link-sent')
            <x-me::alert variant="success">
                {{ __('my-eyes::auth.verify.sent') }}
            </x-me::alert>
        @endif

        <p class="me-hint">
            {{ __('my-eyes::auth.verify.text') }}
        </p>

        <form method="POST" action="{{ route('verification.send') }}">
            @csrf

            <x-me::button type="submit" variant="primary" block>
                {{ __('my-eyes::auth.verify.resend') }}
            </x-me::button>
        </form>

        <form method="POST" action="{{ route('logout') }}">
            @csrf

            <x-me::button type="submit" variant="ghost" block>
                {{ __('my-eyes::ui.layout.sign_out') }}
            </x-me::button>
        </form>
    </div>
</x-me::layouts.auth>
