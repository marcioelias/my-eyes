@props(['title' => null])

{{--
    Shared document head.

    The inline script applies the stored theme before the first paint. It has to
    be inline and before the stylesheet, otherwise the page renders in the wrong
    scheme for a frame and visibly flashes.
--}}

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="csrf-token" content="{{ csrf_token() }}" />

<title>{{ $title ? $title.' · '.config('my-eyes.brand.name') : config('my-eyes.brand.name') }}</title>

<script>
    (function () {
        try {
            var t = localStorage.getItem('my-eyes:theme');
            if (t === 'dark' || t === 'light') {
                document.documentElement.setAttribute('data-theme', t);
            }
        } catch (e) {}
    })();
</script>

@vite(config('my-eyes.vite'))

{{-- Hands the current locale's strings to the JavaScript layer. --}}
<x-me::translations />

{{ $slot }}
