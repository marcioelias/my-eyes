'use client'

import { computeVirtualWindow, shouldVirtualise, t, type TableColumn, type TableRow } from '@my-eyes/core'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cx } from './cx.js'
import { MeFilters } from './MeFilters.js'
import { MePagination } from './MePagination.js'
import { useTable } from './useTable.js'

/**
 * The my-eyes data table, fed by a table payload endpoint.
 *
 * Server-paginated, exactly as the Blade and Livewire tables are. What is added
 * here is responsiveness, not a different data model: a page already fetched
 * comes back from memory, and rows outside the viewport are not in the DOM.
 *
 * @see docs/features/react-package.md
 */
export interface MeTableProps {
    /** URL serving the payload. The application owns this route. */
    endpoint: string
    /** Matches Table::name() on the server; prefixes every query string key. */
    name?: string | null
    syncUrl?: boolean
    striped?: boolean
    compact?: boolean
    /** Row height assumed by the row windowing. */
    rowHeight?: number
    overscan?: number
    searchDebounce?: number
    /**
     * Replaces the request. Use it when the application wraps HTTP — an auth
     * header, a CSRF token, credentials on a cross-origin endpoint.
     */
    fetcher?: typeof fetch
    /** Per-column renderers, keyed by column key — Vue's `cell:<key>` slots. */
    renderCell?: Record<string, (value: unknown, row: TableRow, column: TableColumn, index: number) => ReactNode>
    actions?: ReactNode
    empty?: ReactNode
}

export function MeTable({
    endpoint,
    name = null,
    syncUrl = true,
    striped = false,
    compact = false,
    rowHeight = 44,
    overscan = 8,
    searchDebounce = 400,
    fetcher,
    renderCell,
    actions,
    empty,
}: MeTableProps) {
    const table = useTable({ endpoint, name, syncUrl, ...(fetcher ? { fetcher } : {}) })

    const viewport = useRef<HTMLDivElement | null>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [viewportHeight, setViewportHeight] = useState(0)

    const measure = (): void => {
        setScrollTop(viewport.current?.scrollTop ?? 0)
        setViewportHeight(viewport.current?.clientHeight ?? 0)
    }

    useEffect(() => {
        measure()

        const element = viewport.current

        if (!element || typeof ResizeObserver === 'undefined') {
            return
        }

        const observer = new ResizeObserver(measure)
        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    /*
     * The search box keeps its own draft, unlike Vue's.
     *
     * A controlled input fed straight from the payload would snap back to the
     * server's value between keystrokes, because the commit is debounced. The
     * draft only follows the server when the change came from somewhere else —
     * the URL, the back button — which is what `sent` distinguishes.
     */
    const [draft, setDraft] = useState(table.search)
    const sent = useRef(table.search)
    const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => {
        if (table.search !== sent.current) {
            sent.current = table.search
            setDraft(table.search)
        }
    }, [table.search])

    useEffect(() => () => clearTimeout(debounce.current), [])

    const onSearch = (value: string): void => {
        setDraft(value)
        sent.current = value

        clearTimeout(debounce.current)
        debounce.current = setTimeout(() => table.setSearch(value), searchDebounce)
    }

    /*
     * Below the threshold the spacer rows cost more than they save, so the table
     * renders plainly — which is also the more accessible shape.
     */
    const virtualised = shouldVirtualise(table.rows.length)

    const window = virtualised
        ? computeVirtualWindow({
              total: table.rows.length,
              rowHeight,
              viewportHeight,
              scrollTop,
              overscan,
          })
        : { start: 0, end: table.rows.length, paddingTop: 0, paddingBottom: 0 }

    const alignment = (column: TableColumn): string =>
        cx(
            column.align === 'end' && 'me-table__cell--end',
            column.align === 'center' && 'me-table__cell--center',
        )

    const cell = (column: TableColumn, row: TableRow, index: number): ReactNode => {
        const value = row[column.key]
        const render = renderCell?.[column.key]

        return (
            <td key={column.key} className={alignment(column) || undefined}>
                {render ? (
                    render(value, row, column, index)
                ) : column.html ? (
                    // Only a column the developer marked ->html() renders as
                    // markup; everything else is text, whatever it contains.
                    <span dangerouslySetInnerHTML={{ __html: value == null ? '' : String(value) }} />
                ) : value == null ? (
                    ''
                ) : (
                    String(value)
                )}
            </td>
        )
    }

    const searchable = table.columns.some((column) => column.searchable)
    const filterable = table.schema.length > 0
    const pagination = table.pagination

    const rows: ReactNode[] = []

    if (table.rows.length > 0) {
        if (window.paddingTop > 0) {
            rows.push(<tr key="pad-top" aria-hidden="true" style={{ height: `${window.paddingTop}px` }} />)
        }

        table.rows.slice(window.start, window.end).forEach((row, offset) => {
            const index = window.start + offset

            rows.push(
                <tr key={String(row.id ?? index)} style={{ '--me-row': String(offset) } as CSSProperties}>
                    {table.columns.map((column) => cell(column, row, index))}
                </tr>,
            )
        })

        if (window.paddingBottom > 0) {
            rows.push(<tr key="pad-bottom" aria-hidden="true" style={{ height: `${window.paddingBottom}px` }} />)
        }
    }

    return (
        <div className="me-table-shell">
            {searchable || filterable || actions ? (
                <div className="me-table-toolbar">
                    {searchable ? (
                        <div className="me-table-toolbar__search">
                            <div className="me-input-group">
                                <input
                                    type="search"
                                    className="me-input me-input--sm"
                                    value={draft}
                                    placeholder={t('table.search')}
                                    aria-label={t('table.search')}
                                    onChange={(event) => onSearch(event.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="me-table-toolbar__spacer" />
                    )}

                    <div className="me-table-toolbar__row">
                        {filterable ? (
                            <MeFilters
                                schema={table.schema}
                                conditions={table.filters.conditions}
                                conjunction={table.filters.conjunction}
                                onApply={table.setFilters}
                            />
                        ) : null}
                        {actions}
                    </div>
                </div>
            ) : null}

            {table.error ? (
                <div className="me-alert me-alert--danger" role="alert">
                    <span>{table.error}</span>
                    <button type="button" className="me-btn me-btn--ghost me-btn--sm" onClick={table.retry}>
                        {t('table.retry')}
                    </button>
                </div>
            ) : null}

            <div ref={viewport} className="me-table-viewport" onScroll={measure}>
                <table className={cx('me-table', striped && 'me-table--striped', compact && 'me-table--compact')}>
                    <thead>
                        <tr>
                            {table.columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={alignment(column) || undefined}
                                    aria-sort={
                                        table.sort.key === column.key
                                            ? table.sort.direction === 'asc'
                                                ? 'ascending'
                                                : 'descending'
                                            : undefined
                                    }
                                >
                                    {column.sortable ? (
                                        <button
                                            type="button"
                                            className="me-table__sort"
                                            onClick={() => table.toggleSort(column.key)}
                                        >
                                            <span>{column.label}</span>
                                            <SortChevron />
                                        </button>
                                    ) : (
                                        column.label
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {table.rows.length === 0 ? (
                            <tr>
                                <td colSpan={Math.max(table.columns.length, 1)}>
                                    <div className="me-empty">
                                        {empty ?? (
                                            <span>
                                                {table.search !== '' || table.filters.conditions.length > 0
                                                    ? t('table.emptyFiltered')
                                                    : t('table.empty')}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rows
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.total > 0 ? (
                <div className="me-table-footer">
                    <div className="me-row">
                        <span className="me-table-footer__count">
                            {t('table.showing', {
                                first: String(pagination.from ?? 0),
                                last: String(pagination.to ?? 0),
                                total: String(pagination.total),
                            })}
                        </span>

                        <label className="me-row me-hide-mobile">
                            <span className="me-sr-only">{t('table.perPage')}</span>
                            <select
                                className="me-input me-select me-input--sm"
                                aria-label={t('table.perPage')}
                                value={pagination.perPage}
                                onChange={(event) => table.setPerPage(Number(event.target.value))}
                            >
                                {table.perPageOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {String(option)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <MePagination pagination={pagination} onNavigate={table.goToPage} />
                </div>
            ) : null}
        </div>
    )
}

function SortChevron() {
    return (
        <svg
            className="me-table__sort-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}
