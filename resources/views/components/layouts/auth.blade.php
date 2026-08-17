@props([
    'title' => null,
    'heading' => null,
    'subheading' => null,
    'footer' => null,
    'split' => true,
    'image' => null,
    'tagline' => null,
    'reverse' => false,
])

{{--
    Two halves on a wide screen: the form on one side, a visual on the other.
    One column below 64rem, where the aside is display:none — so a phone never
    downloads the image.

    The form is first in the DOM whichever side it is placed on, so a keyboard
    reaches the fields before the decoration.

    Pass "image" for a photograph, or leave it out and the panel is a gradient
    built from the role tokens. `<x-slot:aside>` replaces the content over it;
    `:split="false"` gives the single centred column back.
--}}

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <x-me::layouts.head :title="$title ?? $heading" />
</head>
<body>
    <div @class(['me-auth', 'me-auth--split' => $split, 'me-auth--reverse' => $split && $reverse])>
        <div class="me-auth__main">
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

                <x-me::card class="me-auth__card">
                    {{ $slot }}
                </x-me::card>

                @if (filled($footer))
                    <p class="me-auth__footer">{{ $footer }}</p>
                @endif
            </div>
        </div>

        @if ($split)
            <aside class="me-auth__aside">
                @if ($image)
                    {{-- Decorative: the screen says everything this image does. --}}
                    <img class="me-auth__image" src="{{ $image }}" alt="" />
                @endif

                <div class="me-auth__aside-content">
                    @if (filled($aside ?? null))
                        {{ $aside }}
                    @else
                        <p class="me-auth__tagline">
                            {{ $tagline ?? config('my-eyes.brand.name') }}
                        </p>
                    @endif
                </div>
            </aside>
        @endif
    </div>
</body>
</html>
