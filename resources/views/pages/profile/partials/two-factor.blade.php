@php
    /*
        Fortify's own endpoints, by path rather than by route name: the paths
        are part of its documented contract, and an application that changes
        `fortify.prefix` edits this published page anyway.

        Three states, and only one of them is ever on screen: off, enabled but
        not yet confirmed, and confirmed.
    */
    $user ??= auth()->user();

    $enabled = filled($user?->two_factor_secret);
    $confirmed = filled($user?->two_factor_confirmed_at);
    $codes = $enabled && $confirmed && method_exists($user, 'recoveryCodes') ? $user->recoveryCodes() : [];
@endphp

<x-me::card
    :title="__('my-eyes::auth.two_factor.title')"
    :description="__('my-eyes::auth.two_factor.text')"
>
    <x-slot:actions>
        <x-me::badge :variant="$confirmed ? 'success' : ($enabled ? 'warning' : null)">
            {{ $confirmed
                ? __('my-eyes::auth.two_factor.on')
                : ($enabled ? __('my-eyes::auth.two_factor.pending') : __('my-eyes::auth.two_factor.off')) }}
        </x-me::badge>
    </x-slot:actions>

    <div class="me-stack">
        @if (! $enabled)
            <form method="POST" action="{{ url('/user/two-factor-authentication') }}">
                @csrf

                <x-me::button type="submit" variant="primary" icon="shield">
                    {{ __('my-eyes::auth.two_factor.enable') }}
                </x-me::button>
            </form>
        @else
            @if (! $confirmed)
                <p class="me-hint">{{ __('my-eyes::auth.two_factor.scan_text') }}</p>

                @if (method_exists($user, 'twoFactorQrCodeSvg'))
                    {{--
                        The one place this package renders data as markup. The
                        SVG comes from Fortify, in this application, over no
                        network at all — it is generated in the same process
                        that renders this page.
                    --}}
                    <div class="me-qr">{!! $user->twoFactorQrCodeSvg() !!}</div>
                @endif

                @if (method_exists($user, 'twoFactorSecret'))
                    <div>
                        <p class="me-hint">{{ __('my-eyes::auth.two_factor.secret') }}</p>
                        <p class="me-secret"><span class="me-secret__value">{{ $user->twoFactorSecret() }}</span></p>
                    </div>
                @endif

                <form method="POST" action="{{ url('/user/confirmed-two-factor-authentication') }}" class="me-stack">
                    @csrf

                    <x-me::input
                        name="code"
                        :label="__('my-eyes::auth.two_factor.code')"
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        required
                    />

                    <div class="me-row me-row--end">
                        <x-me::button type="submit" variant="primary">
                            {{ __('my-eyes::auth.two_factor.confirm') }}
                        </x-me::button>
                    </div>
                </form>
            @else
                <div>
                    <p class="me-label">{{ __('my-eyes::auth.two_factor.recovery_codes') }}</p>
                    <p class="me-hint">{{ __('my-eyes::auth.two_factor.recovery_text') }}</p>

                    @if (filled($codes))
                        <div class="me-recovery-codes">
                            @foreach ($codes as $code)
                                <span>{{ $code }}</span>
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif

            <div class="me-row">
                @if ($confirmed)
                    <form method="POST" action="{{ url('/user/two-factor-recovery-codes') }}">
                        @csrf

                        <x-me::button type="submit" variant="secondary" icon="refresh">
                            {{ __('my-eyes::auth.two_factor.regenerate') }}
                        </x-me::button>
                    </form>
                @endif

                <form method="POST" action="{{ url('/user/two-factor-authentication') }}">
                    @csrf
                    @method('delete')

                    <x-me::button type="submit" variant="outline-danger" icon="shield-off">
                        {{ __('my-eyes::auth.two_factor.disable') }}
                    </x-me::button>
                </form>
            </div>
        @endif
    </div>
</x-me::card>
