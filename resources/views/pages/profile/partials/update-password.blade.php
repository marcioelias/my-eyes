<x-me::card
    :title="__('my-eyes::auth.profile.password')"
    :description="__('my-eyes::auth.profile.password_text')"
>
    <form method="POST" action="{{ route('password.update') }}" class="me-stack">
        @csrf
        @method('put')

        {{--
            Password errors are reported in the "updatePassword" bag, so they
            are passed explicitly rather than picked up from the default one.
        --}}
        <x-me::input
            name="current_password"
            type="password"
            :label="__('my-eyes::auth.fields.current_password')"
            :error="$errors->updatePassword->first('current_password')"
            autocomplete="current-password"
        />

        <x-me::input
            name="password"
            type="password"
            :label="__('my-eyes::auth.fields.new_password')"
            :error="$errors->updatePassword->first('password')"
            autocomplete="new-password"
        />

        <x-me::input
            name="password_confirmation"
            type="password"
            :label="__('my-eyes::auth.fields.confirm_password')"
            :error="$errors->updatePassword->first('password_confirmation')"
            autocomplete="new-password"
        />

        <div class="me-row me-row--end">
            <x-me::button type="submit" variant="primary">{{ __('my-eyes::ui.common.save') }}</x-me::button>
        </div>
    </form>
</x-me::card>
