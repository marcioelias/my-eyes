import { computeVirtualWindow, shouldVirtualise, t, type TableColumn, type TableRow } from '@my-eyes/core'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, type PropType, type VNode } from 'vue'
import { MeFilters } from './MeFilters.js'
import { MePagination } from './MePagination.js'
import { useTable } from './useTable.js'

/**
 * The my-eyes data table, fed by a table payload endpoint.
 *
 * Server-paginated, exactly as the Blade and Livewire tables are. What is
 * added here is responsiveness, not a different data model: a page already
 * fetched comes back from memory, and rows outside the viewport are not in the
 * DOM.
 *
 * @see docs/features/vue-package.md
 */
export const MeTable = defineComponent({
    name: 'MeTable',

    props: {
        /** URL serving the payload. The application owns this route. */
        endpoint: { type: String, required: true },
        /** Matches Table::name() on the server; prefixes every query string key. */
        name: { type: String as PropType<string | null>, default: null },
        syncUrl: { type: Boolean, default: true },
        striped: { type: Boolean, default: false },
        compact: { type: Boolean, default: false },
        /** Row height assumed by the row windowing. */
        rowHeight: { type: Number, default: 44 },
        overscan: { type: Number, default: 8 },
        searchDebounce: { type: Number, default: 400 },
        /**
         * Replaces the request. Use it when the application wraps HTTP — an
         * auth header, a CSRF token, credentials on a cross-origin endpoint.
         */
        fetcher: { type: Function as PropType<typeof fetch>, default: undefined },
    },

    setup(props, { slots }) {
        const table = useTable({
            endpoint: props.endpoint,
            name: props.name,
            syncUrl: props.syncUrl,
            ...(props.fetcher ? { fetcher: props.fetcher } : {}),
        })

        const viewport = ref<HTMLElement | null>(null)
        const scrollTop = ref(0)
        const viewportHeight = ref(0)

        const measure = (): void => {
            scrollTop.value = viewport.value?.scrollTop ?? 0
            viewportHeight.value = viewport.value?.clientHeight ?? 0
        }

        let observer: ResizeObserver | null = null

        onMounted(() => {
            measure()

            if (viewport.value && typeof ResizeObserver !== 'undefined') {
                observer = new ResizeObserver(measure)
                observer.observe(viewport.value)
            }
        })

        onBeforeUnmount(() => observer?.disconnect())

        /*
         * Below the threshold the spacer rows cost more than they save, so the
         * table renders plainly — which is also the more accessible shape.
         */
        const virtualised = computed(() => shouldVirtualise(table.rows.value.length))

        const window = computed(() =>
            virtualised.value
                ? computeVirtualWindow({
                      total: table.rows.value.length,
                      rowHeight: props.rowHeight,
                      viewportHeight: viewportHeight.value,
                      scrollTop: scrollTop.value,
                      overscan: props.overscan,
                  })
                : { start: 0, end: table.rows.value.length, paddingTop: 0, paddingBottom: 0 },
        )

        let debounce: ReturnType<typeof setTimeout> | undefined

        const onSearch = (event: Event): void => {
            const value = (event.target as HTMLInputElement).value

            clearTimeout(debounce)
            debounce = setTimeout(() => table.setSearch(value), props.searchDebounce)
        }

        onBeforeUnmount(() => clearTimeout(debounce))

        const alignment = (column: TableColumn): Record<string, boolean> => ({
            'me-table__cell--end': column.align === 'end',
            'me-table__cell--center': column.align === 'center',
        })

        const cell = (column: TableColumn, row: TableRow, index: number): VNode => {
            const value = row[column.key]
            const slot = slots[`cell:${column.key}`]

            return h('td', { class: alignment(column) }, [
                slot
                    ? slot({ value, row, column, index })
                    : column.html
                      ? // Only a column the developer marked ->html() renders as
                        // markup; everything else is text, whatever it contains.
                        h('span', { innerHTML: value == null ? '' : String(value) })
                      : value == null
                        ? ''
                        : String(value),
            ])
        }

        const header = (): VNode =>
            h('thead', [
                h(
                    'tr',
                    table.columns.value.map((column) =>
                        h(
                            'th',
                            {
                                key: column.key,
                                class: alignment(column),
                                'aria-sort':
                                    table.sort.value.key === column.key
                                        ? table.sort.value.direction === 'asc'
                                            ? 'ascending'
                                            : 'descending'
                                        : undefined,
                            },
                            [
                                column.sortable
                                    ? h(
                                          'button',
                                          {
                                              type: 'button',
                                              class: 'me-table__sort',
                                              onClick: () => table.toggleSort(column.key),
                                          },
                                          [h('span', column.label), chevron('me-table__sort-icon')],
                                      )
                                    : column.label,
                            ],
                        ),
                    ),
                ),
            ])

        const body = (): VNode => {
            const rows = table.rows.value

            if (rows.length === 0) {
                return h('tbody', [
                    h('tr', [
                        h('td', { colspan: Math.max(table.columns.value.length, 1) }, [
                            h('div', { class: 'me-empty' }, [
                                slots.empty?.() ??
                                    h(
                                        'span',
                                        table.search.value !== '' || table.filters.value.conditions.length > 0
                                            ? t('table.emptyFiltered')
                                            : t('table.empty'),
                                    ),
                            ]),
                        ]),
                    ]),
                ])
            }

            const { start, end, paddingTop, paddingBottom } = window.value
            const children: VNode[] = []

            if (paddingTop > 0) {
                children.push(h('tr', { key: 'pad-top', 'aria-hidden': 'true', style: { height: `${paddingTop}px` } }))
            }

            rows.slice(start, end).forEach((row, offset) => {
                const index = start + offset

                children.push(
                    h(
                        'tr',
                        { key: String(row.id ?? index), style: { '--me-row': String(offset) } },
                        table.columns.value.map((column) => cell(column, row, index)),
                    ),
                )
            })

            if (paddingBottom > 0) {
                children.push(
                    h('tr', { key: 'pad-bottom', 'aria-hidden': 'true', style: { height: `${paddingBottom}px` } }),
                )
            }

            return h('tbody', children)
        }

        const toolbar = (): VNode | null => {
            const searchable = table.columns.value.some((column) => column.searchable)
            const filterable = table.schema.value.length > 0

            if (!searchable && !filterable && !slots.actions) {
                return null
            }

            return h('div', { class: 'me-table-toolbar' }, [
                searchable
                    ? h('div', { class: 'me-table-toolbar__search' }, [
                          h('div', { class: 'me-input-group' }, [
                              h('input', {
                                  type: 'search',
                                  class: 'me-input me-input--sm',
                                  value: table.search.value,
                                  placeholder: t('table.search'),
                                  'aria-label': t('table.search'),
                                  onInput: onSearch,
                              }),
                          ]),
                      ])
                    : h('div', { class: 'me-table-toolbar__spacer' }),

                h('div', { class: 'me-table-toolbar__row' }, [
                    filterable
                        ? h(MeFilters, {
                              schema: table.schema.value,
                              conditions: table.filters.value.conditions,
                              conjunction: table.filters.value.conjunction,
                              onApply: table.setFilters,
                          })
                        : null,
                    slots.actions?.(),
                ]),
            ])
        }

        const footer = (): VNode | null => {
            const pagination = table.pagination.value

            if (!pagination || pagination.total === 0) {
                return null
            }

            return h('div', { class: 'me-table-footer' }, [
                h('div', { class: 'me-row' }, [
                    h(
                        'span',
                        { class: 'me-table-footer__count' },
                        t('table.showing', {
                            first: String(pagination.from ?? 0),
                            last: String(pagination.to ?? 0),
                            total: String(pagination.total),
                        }),
                    ),

                    h('label', { class: 'me-row me-hide-mobile' }, [
                        h('span', { class: 'me-sr-only' }, t('table.perPage')),
                        h(
                            'select',
                            {
                                class: 'me-input me-select me-input--sm',
                                'aria-label': t('table.perPage'),
                                onChange: (event: Event) =>
                                    table.setPerPage(Number((event.target as HTMLSelectElement).value)),
                            },
                            table.perPageOptions.value.map((option) =>
                                h(
                                    'option',
                                    { key: option, value: option, selected: option === pagination.perPage },
                                    String(option),
                                ),
                            ),
                        ),
                    ]),
                ]),

                h(MePagination, { pagination, onNavigate: table.goToPage }),
            ])
        }

        return () =>
            h('div', { class: 'me-table-shell' }, [
                toolbar(),

                table.error.value
                    ? h('div', { class: 'me-alert me-alert--danger', role: 'alert' }, [
                          h('span', table.error.value),
                          h(
                              'button',
                              { type: 'button', class: 'me-btn me-btn--ghost me-btn--sm', onClick: table.retry },
                              t('table.retry'),
                          ),
                      ])
                    : null,

                h(
                    'div',
                    {
                        ref: viewport,
                        class: 'me-table-viewport',
                        onScroll: measure,
                    },
                    [
                        h(
                            'table',
                            {
                                class: [
                                    'me-table',
                                    props.striped ? 'me-table--striped' : '',
                                    props.compact ? 'me-table--compact' : '',
                                ],
                            },
                            [header(), body()],
                        ),
                    ],
                ),

                footer(),
            ])
    },
})

function chevron(className: string): VNode {
    return h(
        'svg',
        {
            class: className,
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '1.75',
            'stroke-linecap': 'round',
            'aria-hidden': 'true',
        },
        [h('path', { d: 'm6 9 6 6 6-6' })],
    )
}
