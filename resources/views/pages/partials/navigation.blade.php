{{--
    Sidebar navigation.

    Kept as a partial so every page shares one definition. Edit this file to
    add your own sections; "active" accepts any expression, so use route
    patterns for sections that span several routes.
--}}

<x-me::nav.section>
    <x-me::nav.item
        :href="route('dashboard')"
        icon="layout-dashboard"
        :active="request()->routeIs('dashboard')"
    >
        {{ __('my-eyes::auth.dashboard.heading') }}
    </x-me::nav.item>
</x-me::nav.section>

<x-me::nav.section :title="__('my-eyes::auth.nav.account')">
    @if (Route::has('profile.edit'))
        <x-me::nav.item
            :href="route('profile.edit')"
            icon="user"
            :active="request()->routeIs('profile.*')"
        >
            {{ __('my-eyes::ui.layout.profile') }}
        </x-me::nav.item>
    @endif

    {{-- An example of a collapsible group; delete it when you add your own. --}}
    <x-me::nav.group :label="__('my-eyes::auth.nav.settings')" icon="settings">
        <x-me::nav.subitem href="#">{{ __('my-eyes::auth.nav.general') }}</x-me::nav.subitem>
        <x-me::nav.subitem href="#">{{ __('my-eyes::auth.nav.members') }}</x-me::nav.subitem>
    </x-me::nav.group>
</x-me::nav.section>
