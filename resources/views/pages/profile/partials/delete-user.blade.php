<x-me::card
    :title="__('my-eyes::auth.profile.delete')"
    :description="__('my-eyes::auth.profile.delete_text')"
>
    <form method="POST" action="{{ route('profile.destroy') }}" class="me-stack">
        @csrf
        @method('delete')

        <x-me::input
            name="password"
            type="password"
            :label="__('my-eyes::auth.profile.delete_confirm')"
            :error="$errors->userDeletion->first('password')"
            autocomplete="current-password"
        />

        <div class="me-row me-row--end">
            <x-me::button
                type="submit"
                variant="danger"
                onclick="return confirm('{{ __('my-eyes::auth.profile.delete_prompt') }}')"
            >
                {{ __('my-eyes::auth.profile.delete') }}
            </x-me::button>
        </div>
    </form>
</x-me::card>
