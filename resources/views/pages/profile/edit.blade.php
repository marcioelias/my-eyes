<x-me::layouts.admin
    :heading="__('my-eyes::auth.profile.heading')"
    :subheading="__('my-eyes::auth.profile.subheading')"
>
    <x-slot:nav>
        @include('partials.navigation')
    </x-slot:nav>

    <x-slot:user>
        <x-me::user-menu :name="auth()->user()?->name" :email="auth()->user()?->email" />
    </x-slot:user>

    <div class="me-stack me-stack--loose">
        @include('profile.partials.update-profile-information')
        @include('profile.partials.update-password')
        @include('profile.partials.delete-user')
    </div>
</x-me::layouts.admin>
