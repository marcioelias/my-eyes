<x-me::card
    :title="__('my-eyes::auth.profile.information')"
    :description="__('my-eyes::auth.profile.information_text')"
>
    <form method="POST" action="{{ route('profile.update') }}" class="me-stack">
        @csrf
        @method('patch')

        <x-me::input
            name="name"
            :label="__('my-eyes::auth.fields.name')"
            :value="$user->name"
            autocomplete="name"
            required
        />

        <x-me::input
            name="email"
            type="email"
            :label="__('my-eyes::auth.fields.email')"
            :value="$user->email"
            autocomplete="username"
            required
        />

        @if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && ! $user->hasVerifiedEmail())
            <x-me::alert variant="warning">
                {{ __('my-eyes::auth.profile.unverified') }}

                <button form="send-verification" class="me-btn me-btn--link me-btn--sm">
                    {{ __('my-eyes::auth.profile.resend') }}
                </button>
            </x-me::alert>
        @endif

        <div class="me-row me-row--end">
            <x-me::button type="submit" variant="primary">{{ __('my-eyes::ui.common.save') }}</x-me::button>
        </div>
    </form>

    @if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && ! $user->hasVerifiedEmail())
        <form id="send-verification" method="POST" action="{{ route('verification.send') }}">
            @csrf
        </form>
    @endif
</x-me::card>
