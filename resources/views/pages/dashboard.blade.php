<x-me::layouts.admin
    :heading="__('my-eyes::auth.dashboard.heading')"
    :subheading="__('my-eyes::auth.dashboard.subheading')"
>
    <x-slot:nav>
        @include('partials.navigation')
    </x-slot:nav>

    <x-slot:user>
        <x-me::user-menu :name="auth()->user()?->name" :email="auth()->user()?->email" />
    </x-slot:user>

    <x-slot:actions>
        <x-me::button variant="primary" icon="plus">{{ __('my-eyes::auth.dashboard.new_item') }}</x-me::button>
    </x-slot:actions>

    <div class="me-stack">
        <x-me::card
            :title="__('my-eyes::auth.dashboard.welcome')"
            :description="__('my-eyes::auth.dashboard.welcome_text')"
        >
            <p class="me-hint">
                {{ __('my-eyes::auth.dashboard.components_text') }}
            </p>
        </x-me::card>
    </div>
</x-me::layouts.admin>
