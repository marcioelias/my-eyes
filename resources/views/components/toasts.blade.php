@props([
    'position' => 'top-end',
    'duration' => 5000,
])

{{--
    Bridges Laravel's flashed session messages to the toast system, and holds the
    container the client-side API renders into.

    Place it once in your layout:

        <x-me::toasts position="top-end" />

    Then from a controller:

        return back()->with('toast', ['variant' => 'success', 'text' => __('Saved')]);

    or the shorthands `success`, `error`, `warning`, `info`:

        return back()->with('success', __('Order created'));

    From JavaScript:

        myEyes.toast({ variant: 'danger', title: 'Upload failed', text: '...', duration: 0 })

    A duration of 0 keeps the toast until it is dismissed, and forces the close
    button on.

    Each message is emitted as an empty data-only element that the binding reads
    and removes, so a flashed message and a JS call produce the same toast
    through the same code path.
--}}

@php
    $shorthands = [
        'success' => 'success',
        'error' => 'danger',
        'danger' => 'danger',
        'warning' => 'warning',
        'info' => 'info',
    ];

    $messages = [];

    foreach ($shorthands as $key => $variant) {
        if (session()->has($key)) {
            $messages[] = ['variant' => $variant, 'text' => (string) session($key)];
        }
    }

    // The explicit form wins, and may carry a title and its own duration.
    $explicit = session('toast');

    if (is_array($explicit)) {
        $messages[] = $explicit;
    } elseif (is_string($explicit)) {
        $messages[] = ['text' => $explicit];
    }
@endphp

<div class="me-toasts" data-position="{{ $position }}" role="status" aria-live="polite"></div>

@foreach ($messages as $message)
    <div
        data-me-toast
        data-text="{{ $message['text'] ?? '' }}"
        data-variant="{{ $message['variant'] ?? 'neutral' }}"
        data-position="{{ $message['position'] ?? $position }}"
        data-duration="{{ $message['duration'] ?? $duration }}"
        @if (isset($message['title'])) data-title="{{ $message['title'] }}" @endif
        @if (isset($message['dismissible'])) data-dismissible="{{ $message['dismissible'] ? 'true' : 'false' }}" @endif
        hidden
    ></div>
@endforeach
