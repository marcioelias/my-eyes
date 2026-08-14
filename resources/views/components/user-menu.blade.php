@props([
    'name' => null,
    'email' => null,
    'avatar' => null,
    'showName' => true,
])

{{--
    Topbar account menu. The default items (profile, sign out) point at the
    conventional Laravel route names and are only rendered when those routes
    exist, so this works with Breeze, Fortify or a hand-rolled auth without
    blowing up on a missing route. Pass a slot to replace them entirely.
--}}

@php
    $routes = app('router')->getRoutes();
@endphp

<x-me::dropdown align="end" {{ $attributes }}>
    <x-slot:trigger>
        <button type="button" class="me-user-button" aria-label="{{ __('my-eyes::ui.layout.account_menu') }}">
            <x-me::avatar :name="$name" :src="$avatar" />

            @if ($showName && $name)
                <span class="me-user-button__name me-hide-mobile">{{ $name }}</span>
            @endif
        </button>
    </x-slot:trigger>

    <x-me::dropdown.header :title="$name" :meta="$email" />

    @if (filled($slot))
        {{ $slot }}
    @else
        @if ($routes->hasNamedRoute('profile.edit'))
            <x-me::dropdown.item :href="route('profile.edit')" icon="user">
                {{ __('my-eyes::ui.layout.profile') }}
            </x-me::dropdown.item>
        @endif

        @if ($routes->hasNamedRoute('logout'))
            <x-me::dropdown.divider />

            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <x-me::dropdown.item type="submit" icon="log-out" variant="danger">
                    {{ __('my-eyes::ui.layout.sign_out') }}
                </x-me::dropdown.item>
            </form>
        @endif
    @endif
</x-me::dropdown>
