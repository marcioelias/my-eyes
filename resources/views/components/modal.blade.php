@props([
    'id',
    'variant' => 'primary',
    'icon' => null,
    'title' => null,
    'confirm' => null,
    'cancel' => null,
    'action' => null,
    'method' => 'POST',
    'align' => 'center',
    'size' => null,
    'static' => false,
])

{{--
    Confirmation modal, on the native <dialog> element.

    Two shapes, decided by what you pass:

      - `confirm` only            → a single acknowledge button
      - `confirm` and `cancel`    → the usual pair, cancel focused first

    With `action`, confirming submits a form (CSRF and method spoofing
    included), which is what you want for a destructive action. Without it,
    confirming just closes the dialog and the button carries whatever attributes
    you put on it.

    Pass `static` to make the modal refuse to close on a backdrop click or on
    Escape — the action buttons become the only way out. Use it when a decision
    has to be made and dismissing by accident would leave the user unsure what
    happened. Always pair it with a cancel button, or there is no way out at all.

    Open it from anywhere with `data-me-modal-open="<id>"`.

        <x-me::button variant="danger" data-me-modal-open="delete-user">Delete</x-me::button>

        <x-me::modal
            id="delete-user"
            variant="danger"
            icon="alert-triangle"
            :title="__('Delete this account?')"
            :confirm="__('Delete')"
            :cancel="__('Cancel')"
            :action="route('users.destroy', $user)"
            method="DELETE"
        >
            {{ __('All of its data is removed permanently. This cannot be undone.') }}
        </x-me::modal>
--}}

@php
    $icon ??= match ($variant) {
        'danger' => 'alert-triangle',
        'warning' => 'alert-triangle',
        'success' => 'check-circle',
        default => 'info',
    };

    // The confirm button follows the modal's role, so a destructive
    // confirmation cannot end up with a friendly blue button.
    $confirmVariant = $variant === 'primary' ? 'primary' : $variant;

    $method = strtoupper($method);
    $spoofed = ! in_array($method, ['GET', 'POST'], true);
@endphp

<dialog
    id="{{ $id }}"
    {{ $attributes->class([
        'me-modal',
        "me-modal--{$variant}" => $variant !== 'primary',
        'me-modal--start' => $align === 'start',
        "me-modal--{$size}" => filled($size),
    ]) }}
    aria-labelledby="{{ $id }}-title"
    @if ($static) data-me-modal-static="true" @endif
>
    <div class="me-modal__panel">
        @if ($icon !== false)
            <span class="me-modal__icon">
                <x-me::icon :name="$icon" />
            </span>
        @endif

        @if ($title)
            <h2 class="me-modal__title" id="{{ $id }}-title">{{ $title }}</h2>
        @endif

        @if (filled($slot))
            <p class="me-modal__text">{{ $slot }}</p>
        @endif

        <div class="me-modal__actions">
            @if ($cancel)
                <x-me::button type="button" variant="secondary" data-me-modal-close>
                    {{ $cancel }}
                </x-me::button>
            @endif

            @if ($action)
                <form method="{{ $spoofed ? 'POST' : $method }}" action="{{ $action }}">
                    @if ($method !== 'GET')
                        @csrf
                    @endif

                    @if ($spoofed)
                        @method($method)
                    @endif

                    <x-me::button type="submit" :variant="$confirmVariant" data-me-modal-initial>
                        {{ $confirm ?? __('my-eyes::ui.common.confirm') }}
                    </x-me::button>
                </form>
            @else
                {{-- With no action there is nothing to submit, so confirming just closes. --}}
                <x-me::button
                    type="button"
                    :variant="$confirmVariant"
                    data-me-modal-initial
                    data-me-modal-close
                >
                    {{ $confirm ?? __('my-eyes::ui.common.ok') }}
                </x-me::button>
            @endif
        </div>
    </div>
</dialog>
