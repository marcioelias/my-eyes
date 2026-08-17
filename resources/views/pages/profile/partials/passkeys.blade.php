@php
    /*
        The list comes from the application — Fortify's passkeys relation, or
        anything with id, name and last_used_at. The registration ceremony is
        JavaScript by necessity, so the whole card hides itself in a browser
        without WebAuthn rather than offering a button that cannot work.
    */
    $user ??= auth()->user();
    $passkeys = collect($passkeys ?? $user?->passkeys ?? []);
@endphp

<div data-me-passkey-only hidden>
    <x-me::card
        :title="__('my-eyes::auth.passkeys.title')"
        :description="__('my-eyes::auth.passkeys.text')"
    >
        <div class="me-stack">
            @if ($passkeys->isNotEmpty())
                <div class="me-credential-list">
                    @foreach ($passkeys as $passkey)
                        <div class="me-credential">
                            <span class="me-credential__icon"><x-me::icon name="key" /></span>

                            <div class="me-credential__body">
                                <p class="me-credential__name">{{ $passkey->name }}</p>
                                <p class="me-credential__meta">
                                    {{ __('my-eyes::auth.passkeys.last_used', [
                                        'when' => $passkey->last_used_at
                                            ? $passkey->last_used_at->diffForHumans()
                                            : __('my-eyes::auth.passkeys.never'),
                                    ]) }}
                                </p>
                            </div>

                            <form method="POST" action="{{ url('/user/passkeys/'.$passkey->id) }}">
                                @csrf
                                @method('delete')

                                <x-me::button
                                    type="submit"
                                    variant="ghost"
                                    size="sm"
                                    icon="trash"
                                    :aria-label="__('my-eyes::ui.common.remove')"
                                />
                            </form>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="me-hint">{{ __('my-eyes::auth.passkeys.empty') }}</p>
            @endif

            <div class="me-row">
                <x-me::input
                    id="me-passkey-name"
                    name="passkey_name"
                    :label="__('my-eyes::auth.passkeys.name')"
                    :placeholder="__('my-eyes::auth.passkeys.name_placeholder')"
                    autocomplete="off"
                />
            </div>

            <div class="me-row">
                <x-me::button
                    type="button"
                    variant="secondary"
                    icon="plus"
                    data-me-passkey="register"
                    data-name-from="#me-passkey-name"
                >
                    {{ __('my-eyes::auth.passkeys.add') }}
                </x-me::button>
            </div>

            <p class="me-error" data-me-passkey-error hidden></p>
        </div>
    </x-me::card>
</div>
