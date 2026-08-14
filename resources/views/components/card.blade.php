@props([
    'title' => null,
    'description' => null,
    'actions' => null,
    'footer' => null,
    'flush' => false,
])

{{-- "flush" drops the body padding, for cards wrapping a table or a list. --}}

<div {{ $attributes->class(['me-card']) }}>
    @if ($title || $description || filled($actions))
        <div class="me-card__header">
            <div>
                @if ($title)
                    <h2 class="me-card__title">{{ $title }}</h2>
                @endif

                @if ($description)
                    <p class="me-card__description">{{ $description }}</p>
                @endif
            </div>

            @if (filled($actions))
                <div class="me-card__header-actions">{{ $actions }}</div>
            @endif
        </div>
    @endif

    <div @class(['me-card__body']) @if ($flush) style="padding:0" @endif>
        {{ $slot }}
    </div>

    @if (filled($footer))
        <div class="me-card__footer me-card__footer--end">{{ $footer }}</div>
    @endif
</div>
