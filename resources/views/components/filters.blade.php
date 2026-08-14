@props(['table'])

{{--
    Advanced filter builder.

    The schema comes from the column definitions, so the fields and operators
    offered here are exactly the ones the query will accept — the UI cannot ask
    for something the backend rejects.

    Rows are rendered by the JS binding rather than Blade, so a row restored
    from the URL and a row the user adds share one implementation. Without
    JavaScript the builder does not open, but filters already in the URL still
    apply, since the server never trusts the client for that.

    @param  \MyEyes\Table\Table  $table
--}}

@php
    $count = $table->filters()->count();

    $labels = [
        'where' => __('my-eyes::filters.ui.where'),
        'and' => __('my-eyes::filters.ui.and'),
        'or' => __('my-eyes::filters.ui.or'),
        'remove' => __('my-eyes::filters.ui.remove'),
        'value' => __('my-eyes::filters.ui.value'),
        'rangeSeparator' => '–',
        'commaHint' => __('my-eyes::filters.ui.comma_hint'),
        'yes' => __('my-eyes::ui.common.yes'),
        'no' => __('my-eyes::ui.common.no'),
    ];
@endphp

<div class="me-filters-wrap" data-me-filters-wrap data-open="false">
    <button type="button" class="me-btn me-btn--secondary me-btn--sm" data-me-filters-trigger>
        <x-me::icon name="settings" />
        <span>{{ __('my-eyes::filters.ui.title') }}</span>

        @if ($count > 0)
            <x-me::badge variant="primary">{{ $count }}</x-me::badge>
        @endif
    </button>

    <div class="me-filters-panel" data-me-filters-panel>
        <div class="me-filters-panel__body">
            <div
                class="me-filters"
                data-me-filters
                data-schema="{{ json_encode($table->filterSchema(), JSON_UNESCAPED_UNICODE) }}"
                data-conditions="{{ json_encode($table->filters()->toQuery(), JSON_UNESCAPED_UNICODE) }}"
                data-conjunction="{{ $table->filters()->conjunction }}"
                data-labels="{{ json_encode($labels, JSON_UNESCAPED_UNICODE) }}"
            >
                <div class="me-filters__rows" data-me-filter-rows></div>

                <p class="me-filters__empty" data-me-filter-empty>
                    {{ __('my-eyes::filters.ui.empty') }}
                </p>

                <div class="me-filters__actions">
                    <x-me::button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        icon="plus"
                        data-me-filter-add
                    >
                        {{ __('my-eyes::filters.ui.add') }}
                    </x-me::button>

                    <div class="me-filters__actions-end">
                        <x-me::button type="button" variant="ghost" size="sm" data-me-filter-clear>
                            {{ __('my-eyes::filters.ui.clear') }}
                        </x-me::button>

                        <x-me::button type="submit" variant="primary" size="sm">
                            {{ __('my-eyes::filters.ui.apply') }}
                        </x-me::button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
