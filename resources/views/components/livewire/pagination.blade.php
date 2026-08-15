@props([
    'paginator',
    'pageName' => 'page',
    'window' => 1,
])

{{--
    The same pagination control as the Blade one, paging over the wire.

    Buttons rather than links: there is no URL to follow, and a link that does
    not navigate is a lie to assistive technology. Livewire keeps the page in
    the query string on its own, so the address bar still tracks along.

    @param  \Illuminate\Contracts\Pagination\LengthAwarePaginator  $paginator
--}}

@php
    $current = $paginator->currentPage();
    $last = $paginator->lastPage();

    $pages = collect(range(1, $last))
        ->filter(fn (int $page): bool => $page === 1
            || $page === $last
            || abs($page - $current) <= $window)
        ->values();
@endphp

@if ($last > 1)
    <nav class="me-pagination" role="navigation" aria-label="{{ __('my-eyes::ui.pagination.label') }}">
        <button
            type="button"
            class="me-pagination__item"
            aria-label="{{ __('my-eyes::filters.table.previous') }}"
            @if ($paginator->onFirstPage())
                disabled
            @else
                wire:click="previousPage('{{ $pageName }}')"
            @endif
        >
            <x-me::icon name="chevron-right" style="transform: scaleX(-1)" />
        </button>

        @php $previous = 0; @endphp

        @foreach ($pages as $page)
            @if ($page - $previous > 1)
                <span class="me-pagination__gap" aria-hidden="true">…</span>
            @endif

            <button
                type="button"
                class="me-pagination__item me-pagination__item--number"
                wire:click="gotoPage({{ $page }}, '{{ $pageName }}')"
                wire:key="page-{{ $page }}"
                @if ($page === $current) aria-current="page" @endif
            >
                {{ $page }}
            </button>

            @php $previous = $page; @endphp
        @endforeach

        <button
            type="button"
            class="me-pagination__item"
            aria-label="{{ __('my-eyes::filters.table.next') }}"
            @if (! $paginator->hasMorePages())
                disabled
            @else
                wire:click="nextPage('{{ $pageName }}')"
            @endif
        >
            <x-me::icon name="chevron-right" />
        </button>
    </nav>
@endif
