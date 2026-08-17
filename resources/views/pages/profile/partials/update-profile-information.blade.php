<x-me::card
    :title="__('my-eyes::auth.profile.information')"
    :description="__('my-eyes::auth.profile.information_text')"
>
    {{--
        The avatar is posted as a plain file field named "avatar". Storing,
        resizing and serving it are the application's — this package ships no
        storage driver and never has.
    --}}
    <form method="POST" action="{{ route('profile.update') }}" class="me-stack" enctype="multipart/form-data">
        @csrf
        @method('patch')

        <div class="me-avatar-field">
            <x-me::avatar :name="$user->name" :src="$user->avatar_url" size="xl" />

            <div class="me-avatar-field__control">
                <x-me::upload
                    name="avatar"
                    accept="image/png,image/jpeg,image/webp"
                    :label="__('my-eyes::auth.profile.avatar')"
                    :hint="__('my-eyes::auth.profile.avatar_text')"
                />
            </div>
        </div>

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
