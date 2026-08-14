@props([
    'paginator',
    'window' => 1,
])

{{--
    Pagination for a LengthAwarePaginator.

    Built here rather than through the framework's pagination views so it shares
    the design system's tokens. The page window keeps the control a fixed width
    however many pages there are; on phones the numbers are hidden by CSS and
    only prev/next remain.

    @param  \Illuminate\Contracts\Pagination\LengthAwarePaginator  $paginator
--}}

@php
    $current = $paginator->currentPage();
    $last = $paginator->lastPage();

    // Always show first and last, plus a window around the current page.
    $pages = collect(range(1, $last))
        ->filter(fn (int $page): bool => $page === 1
            || $page === $last
            || abs($page - $current) <= $window)
        ->values();
@endphp

@if ($last > 1)
    <nav class="me-pagination" role="navigation" aria-label="{{ __('my-eyes::ui.pagination.label') }}">
        <a
            @if ($paginator->onFirstPage()) aria-disabled="true" @else href="{{ $paginator->previousPageUrl() }}" @endif
            class="me-pagination__item"
            aria-label="{{ __('my-eyes::filters.table.previous') }}"
            rel="prev"
        >
            <x-me::icon name="chevron-right" style="transform: scaleX(-1)" />
        </a>

        @php $previous = 0; @endphp

        @foreach ($pages as $page)
            @if ($page - $previous > 1)
                <span class="me-pagination__gap" aria-hidden="true">…</span>
            @endif

            <a
                href="{{ $paginator->url($page) }}"
                class="me-pagination__item me-pagination__item--number"
                @if ($page === $current) aria-current="page" @endif
            >
                {{ $page }}
            </a>

            @php $previous = $page; @endphp
        @endforeach

        <a
            @if (! $paginator->hasMorePages()) aria-disabled="true" @else href="{{ $paginator->nextPageUrl() }}" @endif
            class="me-pagination__item"
            aria-label="{{ __('my-eyes::filters.table.next') }}"
            rel="next"
        >
            <x-me::icon name="chevron-right" />
        </a>
    </nav>
@endif
