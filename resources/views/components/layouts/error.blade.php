@props([
    'status' => null,
    'title' => null,
    'icon' => null,
    'severity' => null,
    'home' => true,
    'back' => true,
])

{{--
    Shared frame for the 4xx/5xx pages.

    Severity picks the role colour: 4xx reads as a warning (you asked for
    something that is not there), 5xx as a danger (we broke). It falls back to
    the status code so a custom page only has to pass the number.
--}}

@php
    $severity ??= match (true) {
        $status >= 500 => 'danger',
        $status >= 400 => 'warning',
        default => 'info',
    };
@endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <x-me::layouts.head :title="$title ?? $status" />
</head>
<body>
    <div class="me-error-page me-error-page--{{ $severity }}">
        <div class="me-error-page__panel">
            @if ($icon)
                <span class="me-error-page__badge">
                    <x-me::icon :name="$icon" />
                </span>
            @endif

            @if ($status)
                <p class="me-error-page__status">{{ $status }}</p>
            @endif

            @if ($title)
                <h1 class="me-error-page__title">{{ $title }}</h1>
            @endif

            <p class="me-error-page__text">{{ $slot }}</p>

            <div class="me-error-page__actions">
                @if ($back)
                    <x-me::button variant="secondary" icon="arrow-left" onclick="history.back()">
                        {{ __('my-eyes::ui.errors.go_back') }}
                    </x-me::button>
                @endif

                @if ($home)
                    <x-me::button variant="primary" :href="url('/')">
                        {{ __('my-eyes::ui.errors.back_home') }}
                    </x-me::button>
                @endif
            </div>
        </div>
    </div>
</body>
</html>
