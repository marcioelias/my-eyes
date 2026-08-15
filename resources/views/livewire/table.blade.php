{{--
    The my-eyes table, rendered by a Livewire component.

    Same markup and same classes as <x-me::table />; only the plumbing differs.
    Where the Blade table is a GET form of links and submits, this one is
    wire:click and wire:model, and Livewire keeps the same query string keys in
    the URL — so a link to a Blade table and a link to this one describe the
    same view of the same data.

    @param  \MyEyes\Table\Table  $table
--}}

@php
    $columns = $table->columns();
    $rows = $table->rows();
    $paginator = $table->paginator();

    $hasFilters = $table->filterableColumns() !== [];
    $hasSearch = $table->isSearchable();
    $hasToolbar = $hasFilters || $hasSearch;

    $isFiltered = $table->search() !== '' || ! $table->filters()->isEmpty();
@endphp

<div class="me-table-shell">
    @if ($hasToolbar)
        <div class="me-table-toolbar">
            @if ($hasSearch)
                <div class="me-table-toolbar__search">
                    <div class="me-input-group">
                        <span class="me-input-addon">
                            <x-me::icon name="search" />
                        </span>

                        {{-- Debounced: one round trip per pause, not per keystroke. --}}
                        <input
                            type="search"
                            class="me-input me-input--sm"
                            wire:model.live.debounce.400ms="search"
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
                    <x-me::livewire.filters :table="$table" />
                @endif
            </div>
        </div>
    @endif

    <div class="me-table-viewport" wire:loading.class="me-table-viewport--loading">
        <table @class(['me-table', 'me-table--striped' => $striped, 'me-table--compact' => $compact])>
            <thead>
                <tr>
                    @foreach ($columns as $column)
                        <th @class([
                            'me-table__cell--end' => $column->alignment() === 'end',
                            'me-table__cell--center' => $column->alignment() === 'center',
                        ]) @if ($table->sortKey() === $column->key()) aria-sort="{{ $table->sortDirection() === 'asc' ? 'ascending' : 'descending' }}" @endif>
                            @if ($column->isSortable())
                                <button type="button" class="me-table__sort" wire:click="sortBy('{{ $column->key() }}')">
                                    <span>{{ $column->label() }}</span>
                                    <x-me::icon name="chevron-down" class="me-table__sort-icon" />
                                </button>
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
                    <tr style="--me-row: {{ $index }}" wire:key="row-{{ data_get($row, 'id') ?? $index }}">
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
                                <x-me::icon name="search" />
                                <span>
                                    {{ $isFiltered
                                        ? __('my-eyes::filters.table.empty_filtered')
                                        : __('my-eyes::filters.table.empty') }}
                                </span>
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

                <label class="me-row me-hide-mobile">
                    <span class="me-sr-only">{{ __('my-eyes::filters.table.per_page') }}</span>

                    {{--
                        $set rather than wire:model: the property starts null,
                        meaning "whatever the table declared", and only the
                        table knows what that is. Marking the option the server
                        actually applied keeps the control truthful.
                    --}}
                    <select
                        class="me-input me-select me-input--sm"
                        wire:change="$set('perPage', $event.target.value)"
                        aria-label="{{ __('my-eyes::filters.table.per_page') }}"
                    >
                        @foreach ($table->perPageChoices() as $option)
                            <option value="{{ $option }}" @selected($table->currentPerPage() === $option)>
                                {{ $option }}
                            </option>
                        @endforeach
                    </select>
                </label>
            </div>

            <x-me::livewire.pagination :paginator="$paginator" :page-name="$table->parameter('page')" />
        </div>
    @endif
</div>
