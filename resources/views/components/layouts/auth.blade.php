@props([
    'title' => null,
    'heading' => null,
    'subheading' => null,
    'footer' => null,
])

{{-- Centred single-column layout for login, register and password screens. --}}

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <x-me::layouts.head :title="$title ?? $heading" />
</head>
<body>
    <div class="me-auth">
        <div class="me-auth__panel">
            <x-me::brand class="me-auth__brand" />

            <div>
                @if ($heading)
                    <h1 class="me-auth__heading">{{ $heading }}</h1>
                @endif

                @if ($subheading)
                    <p class="me-auth__subheading">{{ $subheading }}</p>
                @endif
            </div>

            @if (session('status'))
                <x-me::alert variant="success">{{ session('status') }}</x-me::alert>
            @endif

            <x-me::card>
                {{ $slot }}
            </x-me::card>

            @if (filled($footer))
                <p class="me-auth__footer">{{ $footer }}</p>
            @endif
        </div>
    </div>
</body>
</html>
