@props([
    'table',
    'striped' => false,
    'compact' => false,
    'search' => true,
    'filters' => true,
    'perPage' => true,
    'empty' => null,
    'actions' => null,
])

{{--
    Renders a MyEyes\Table\Table.

    Everything is a GET form, so sorting, filtering and paging are ordinary
    links and submits: shareable URLs, working back button, no JavaScript
    required for the results themselves.

    @param  \MyEyes\Table\Table  $table
--}}

@php
    $columns = $table->columns();
    $rows = $table->rows();
    $paginator = $table->paginator();

    $hasFilters = $filters && $table->filterableColumns() !== [];
    $hasSearch = $search && $table->isSearchable();
    $hasToolbar = $hasFilters || $hasSearch || $perPage || filled($actions);

    $isFiltered = $table->search() !== '' || ! $table->filters()->isEmpty();
@endphp

<div {{ $attributes->class(['me-table-shell']) }}>
    @if ($hasToolbar)
        <form method="GET" class="me-table-toolbar" data-me-table-form>
            {{--
                Sort and page size must survive a search submit.
                Read from the table's request, not the global helper, so a table
                built with forRequest() still renders a consistent form.
            --}}
            @foreach ($table->request()->except([$table->parameter('q'), $table->parameter('filters'), $table->parameter('page'), '_token']) as $key => $value)
                @if (! is_array($value))
                    <input type="hidden" name="{{ $key }}" value="{{ $value }}" />
                @endif
            @endforeach

            @if ($hasSearch)
                <div class="me-table-toolbar__search">
                    <div class="me-input-group">
                        <span class="me-input-addon">
                            <x-me::icon name="search" />
                        </span>

                        <input
                            type="search"
                            class="me-input me-input--sm"
                            name="{{ $table->parameter('q') }}"
                            value="{{ $table->search() }}"
                            placeholder="{{ __('my-eyes::filters.table.search') }}"
                            aria-label="{{ __('my-eyes::filters.table.search') }}"
                        />
                    </div>
                </div>
            @else
                <div class="me-table-toolbar__spacer"></div>
            @endif

            <div class="me-table-toolbar__row">
                @if ($hasFilters)
                    <x-me::filters :table="$table" />
                @endif

                @if ($isFiltered)
                    <a href="{{ $table->resetUrl() }}" class="me-btn me-btn--ghost me-btn--sm">
                        {{ __('my-eyes::filters.ui.clear') }}
                    </a>
                @endif

                @if ($hasSearch || $hasFilters)
                    <x-me::button type="submit" variant="secondary" size="sm">
                        {{ __('my-eyes::filters.ui.apply') }}
                    </x-me::button>
                @endif

                {{ $actions }}
            </div>
        </form>
    @endif

    <div class="me-table-viewport">
        <table @class(['me-table', 'me-table--striped' => $striped, 'me-table--compact' => $compact])>
            <thead>
                <tr>
                    @foreach ($columns as $column)
                        <th @class([
                            'me-table__cell--end' => $column->alignment() === 'end',
                            'me-table__cell--center' => $column->alignment() === 'center',
                        ]) @if ($table->sortKey() === $column->key()) aria-sort="{{ $table->sortDirection() === 'asc' ? 'ascending' : 'descending' }}" @endif>
                            @if ($column->isSortable())
                                <a
                                    href="{{ $table->sortUrl($column) }}"
                                    class="me-table__sort"
                                    @if ($table->sortKey() === $column->key())
                                        aria-sort="{{ $table->sortDirection() === 'asc' ? 'ascending' : 'descending' }}"
                                    @endif
                                >
                                    <span>{{ $column->label() }}</span>
                                    <x-me::icon name="chevron-down" class="me-table__sort-icon" />
                                </a>
                            @else
                                {{ $column->label() }}
                            @endif
                        </th>
                    @endforeach
                </tr>
            </thead>

            <tbody>
                @forelse ($rows as $index => $row)
                    {{-- --me-row staggers the entry animation. --}}
                    <tr style="--me-row: {{ $index }}">
                        @foreach ($columns as $column)
                            <td @class([
                                'me-table__cell--end' => $column->alignment() === 'end',
                                'me-table__cell--center' => $column->alignment() === 'center',
                            ])>
                                {{ $column->render($row) }}
                            </td>
                        @endforeach
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ max(count($columns), 1) }}">
                            <div class="me-empty">
                                @if (filled($empty))
                                    {{ $empty }}
                                @else
                                    <x-me::icon name="search" />
                                    <span>
                                        {{ $isFiltered
                                            ? __('my-eyes::filters.table.empty_filtered')
                                            : __('my-eyes::filters.table.empty') }}
                                    </span>
                                @endif
                            </div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if ($paginator->total() > 0)
        <div class="me-table-footer">
            <div class="me-row">
                <span class="me-table-footer__count">
                    {{ __('my-eyes::filters.table.showing', [
                        'first' => $paginator->firstItem(),
                        'last' => $paginator->lastItem(),
                        'total' => $paginator->total(),
                    ]) }}
                </span>

                @if ($perPage)
                    <label class="me-row me-hide-mobile">
                        <span class="me-sr-only">{{ __('my-eyes::filters.table.per_page') }}</span>

                        <select class="me-input me-select me-input--sm" data-me-navigate aria-label="{{ __('my-eyes::filters.table.per_page') }}">
                            @foreach ($table->perPageChoices() as $option)
                                <option value="{{ $table->perPageUrl($option) }}" @selected($table->currentPerPage() === $option)>
                                    {{ $option }}
                                </option>
                            @endforeach
                        </select>
                    </label>
                @endif
            </div>

            <x-me::pagination :paginator="$paginator" />
        </div>
    @endif
</div>
