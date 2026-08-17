@php
    /*
        Fortify tells the two factors apart by field name: "code" for the
        authenticator app, "recovery_code" for a recovery code. Sending both
        is what produces the confusing failure, so the screen renders one at a
        time and the query string carries the choice — no JavaScript, and the
        back button works.
    */
    $recovery = request()->boolean('recovery');
@endphp

<x-me::layouts.auth
    :heading="__('my-eyes::auth.two_factor.challenge_heading')"
    :subheading="$recovery
        ? __('my-eyes::auth.two_factor.challenge_recovery_subheading')
        : __('my-eyes::auth.two_factor.challenge_subheading')"
>
    <form method="POST" action="{{ url('/two-factor-challenge') }}" class="me-stack">
        @csrf

        @if ($recovery)
            <x-me::input
                name="recovery_code"
                :label="__('my-eyes::auth.two_factor.recovery_code')"
                autocomplete="one-time-code"
                required
                autofocus
            />
        @else
            <x-me::input
                name="code"
                :label="__('my-eyes::auth.two_factor.code')"
                inputmode="numeric"
                autocomplete="one-time-code"
                required
                autofocus
            />
        @endif

        <x-me::button type="submit" variant="primary" block>
            {{ __('my-eyes::auth.two_factor.challenge_submit') }}
        </x-me::button>
    </form>

    <x-slot:footer>
        <a href="{{ request()->fullUrlWithQuery(['recovery' => $recovery ? null : 1]) }}" class="me-btn me-btn--link me-btn--sm">
            {{ $recovery
                ? __('my-eyes::auth.two_factor.use_code')
                : __('my-eyes::auth.two_factor.use_recovery') }}
        </a>
    </x-slot:footer>
</x-me::layouts.auth>
