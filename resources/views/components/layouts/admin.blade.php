@props([
    'title' => null,
    'heading' => null,
    'subheading' => null,
    'nav' => null,
    'topbar' => null,
    'actions' => null,
    'user' => null,
    'footer' => null,
    'sidebarFooter' => null,
])

{{--
    Admin shell: sidebar, top bar, content and an optional footer.

    Mobile first — the sidebar is a drawer below 1024px and a permanent column
    above it, collapsible to an icon rail. All of that is CSS; the JS only
    flips data attributes on .me-shell.
--}}

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <x-me::layouts.head :title="$title ?? $heading" />
</head>
<body>
    <a href="#me-main" class="me-skip-link">{{ __('my-eyes::ui.layout.skip') }}</a>

    <div class="me-shell" data-me-shell data-sidebar-open="false" data-sidebar-collapsed="false">
        <aside class="me-sidebar" data-me-sidebar>
            <div class="me-sidebar__header">
                <x-me::brand />

                <x-me::button
                    variant="ghost"
                    size="sm"
                    icon="x"
                    class="me-sidebar__close"
                    data-me-sidebar-close
                    aria-label="{{ __('my-eyes::ui.layout.close_menu') }}"
                />
            </div>

            <nav class="me-sidebar__body me-nav" aria-label="{{ __('my-eyes::ui.layout.main_nav') }}">
                {{ $nav }}
            </nav>

            @if (filled($sidebarFooter) || config('my-eyes.layout.sidebar_collapsible'))
                <div class="me-sidebar__footer">
                    {{ $sidebarFooter }}

                    @if (config('my-eyes.layout.sidebar_collapsible'))
                        <button type="button" class="me-nav__item" data-me-sidebar-collapse>
                            <x-me::icon name="panel-left" />
                            <span class="me-hide-collapsed">{{ __('my-eyes::ui.layout.collapse') }}</span>
                        </button>
                    @endif
                </div>
            @endif
        </aside>

        <div class="me-shell__overlay" data-me-sidebar-close aria-hidden="true"></div>

        <div class="me-shell__main">
            <header class="me-topbar">
                <x-me::button
                    variant="ghost"
                    size="sm"
                    icon="menu"
                    class="me-shell__toggle"
                    data-me-sidebar-toggle
                    aria-label="{{ __('my-eyes::ui.layout.open_menu') }}"
                />

                @if ($heading)
                    <span class="me-topbar__title me-hide-mobile">{{ $heading }}</span>
                @endif

                <div class="me-topbar__spacer"></div>

                {{ $topbar }}

                <x-me::theme-toggle size="sm" />

                {{ $user }}
            </header>

            <main class="me-content" id="me-main">
                @if ($heading || filled($actions))
                    <div class="me-content__header">
                        <div>
                            @if ($heading)
                                <h1 class="me-content__heading">{{ $heading }}</h1>
                            @endif

                            @if ($subheading)
                                <p class="me-content__subheading">{{ $subheading }}</p>
                            @endif
                        </div>

                        @if (filled($actions))
                            <div class="me-content__actions">{{ $actions }}</div>
                        @endif
                    </div>
                @endif

                @if (session('status'))
                    <div class="me-content__status">
                        <x-me::alert variant="success" dismissible>
                            {{ session('status') }}
                        </x-me::alert>
                    </div>
                @endif

                {{ $slot }}
            </main>

            @if (config('my-eyes.layout.footer'))
                <footer class="me-footer">
                    <div class="me-footer__inner">
                        @if (filled($footer))
                            {{ $footer }}
                        @else
                            <span>&copy; {{ date('Y') }} {{ config('my-eyes.brand.name') }}</span>
                        @endif
                    </div>
                </footer>
            @endif
        </div>
    </div>
</body>
</html>
