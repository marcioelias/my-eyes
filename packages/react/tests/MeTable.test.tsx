import type { TablePayload } from '@my-eyes/core'
import { fireEvent, render } from '@testing-library/react'
import { StrictMode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { respondWith, settle, tablePayload } from '../../core/tests/fixtures.js'
import { MeBadge } from '../src/primitives.js'
import { MeTable } from '../src/MeTable.js'

/**
 * The React table against real payloads — the same fixture the Vue suite uses.
 *
 * @see docs/features/react-package.md
 * @see docs/policies/table-payload.md
 */

const fetcherFor = (body: TablePayload | (() => TablePayload)) =>
    vi.fn(async () => respondWith(typeof body === 'function' ? body() : body))

beforeEach(() => {
    window.history.replaceState({}, '', '/records')
})

describe('rendering', () => {
    it('renders the headers and rows the payload describes', async () => {
        const { container } = render(
            <MeTable endpoint="/table" fetcher={fetcherFor(tablePayload())} syncUrl={false} />,
        )

        await settle()

        expect(Array.from(container.querySelectorAll('thead th')).map((th) => th.textContent)).toEqual([
            'Name',
            'Status',
        ])
        expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
        expect(container.textContent).toContain('Ana Souza')
    })

    it('carries the column alignment through to the cells', async () => {
        const { container } = render(
            <MeTable endpoint="/table" fetcher={fetcherFor(tablePayload())} syncUrl={false} />,
        )

        await settle()

        const cells = Array.from(container.querySelectorAll('tbody tr:first-child td'))

        expect(cells[0]?.className).toBe('')
        expect(cells[1]?.className).toContain('me-table__cell--end')
    })

    it('renders a cell through renderCell when one is given', async () => {
        const { container } = render(
            <MeTable
                endpoint="/table"
                fetcher={fetcherFor(tablePayload())}
                syncUrl={false}
                renderCell={{
                    status: (value) => (
                        <MeBadge variant={value === 'active' ? 'success' : 'danger'}>{String(value)}</MeBadge>
                    ),
                }}
            />,
        )

        await settle()

        expect(container.querySelectorAll('.me-badge')).toHaveLength(2)
        expect(container.querySelector('.me-badge--success')?.textContent).toBe('active')
    })

    it('renders a value as text unless the column asked for markup', async () => {
        const withMarkup = tablePayload({
            rows: [{ name: '<b>bold</b>', status: '<i>x</i>' }],
            columns: [
                { key: 'name', label: 'Name', align: 'start', sortable: false, searchable: false, filterable: false, html: false },
                { key: 'status', label: 'Status', align: 'start', sortable: false, searchable: false, filterable: false, html: true },
            ],
        })

        const { container } = render(<MeTable endpoint="/table" fetcher={fetcherFor(withMarkup)} syncUrl={false} />)

        await settle()

        const cells = container.querySelectorAll('tbody tr:first-child td')

        expect(cells[0]?.querySelector('b')).toBeNull()
        expect(cells[0]?.textContent).toBe('<b>bold</b>')
        expect(cells[1]?.querySelector('i')).not.toBeNull()
    })

    it('shows the empty state, and says so differently when filtered', async () => {
        const empty = render(
            <MeTable endpoint="/table" fetcher={fetcherFor(tablePayload({ rows: [] }))} syncUrl={false} />,
        )

        await settle()

        expect(empty.container.querySelector('.me-empty')?.textContent).toBe('No records found')

        const filtered = render(
            <MeTable
                endpoint="/table"
                fetcher={fetcherFor(tablePayload({ rows: [], search: 'zzz' }))}
                syncUrl={false}
            />,
        )

        await settle()

        expect(filtered.container.querySelector('.me-empty')?.textContent).toBe('No records match these filters')
    })

    it('reports a failed request, with a way back', async () => {
        const fetcher = vi.fn(async () => ({ ok: false, status: 500, statusText: 'Server Error' }) as Response)

        const { container } = render(<MeTable endpoint="/table" fetcher={fetcher} syncUrl={false} />)

        await settle()

        expect(container.querySelector('.me-alert--danger')?.textContent).toContain('500')

        container.querySelector<HTMLButtonElement>('.me-alert--danger button')?.click()

        expect(fetcher).toHaveBeenCalledTimes(2)
    })
})

describe('interaction', () => {
    it('sorts through the server, never in the browser', async () => {
        const fetcher = fetcherFor(tablePayload())

        const { container } = render(<MeTable endpoint="/table" fetcher={fetcher} syncUrl={false} />)

        await settle()

        container.querySelector<HTMLButtonElement>('.me-table__sort')?.click()

        await settle()

        expect(fetcher).toHaveBeenCalledTimes(2)
        expect(String(fetcher.mock.calls[1]?.[0])).toContain('sort=name')
    })

    it('debounces the search, and keeps the keystrokes on screen meanwhile', async () => {
        vi.useFakeTimers()

        const fetcher = fetcherFor(tablePayload())

        const { container } = render(
            <MeTable endpoint="/table" fetcher={fetcher} syncUrl={false} searchDebounce={300} />,
        )

        await vi.advanceTimersByTimeAsync(1)

        const input = container.querySelector<HTMLInputElement>('input[type="search"]') as HTMLInputElement

        fireEvent.change(input, { target: { value: 'an' } })
        fireEvent.change(input, { target: { value: 'ana' } })

        // The draft is local, so typing is never swallowed by the payload.
        expect(input.value).toBe('ana')
        expect(fetcher).toHaveBeenCalledTimes(1)

        await vi.advanceTimersByTimeAsync(320)

        expect(fetcher).toHaveBeenCalledTimes(2)
        expect(String(fetcher.mock.calls[1]?.[0])).toContain('q=ana')

        vi.useRealTimers()
    })

    it('serves a page it has already fetched from memory', async () => {
        const paged = tablePayload({ pagination: { page: 1, perPage: 1, total: 2, lastPage: 2, from: 1, to: 1 } })
        const fetcher = fetcherFor(paged)

        const { container } = render(<MeTable endpoint="/table" fetcher={fetcher} syncUrl={false} />)

        await settle()

        const next = container.querySelectorAll<HTMLButtonElement>('.me-pagination__item')

        next[next.length - 1]?.click()
        await settle()

        expect(fetcher).toHaveBeenCalledTimes(2)

        // Back to page 1: already in the cache, so no third request.
        container.querySelector<HTMLButtonElement>('.me-pagination__item--number')?.click()
        await settle()

        expect(fetcher).toHaveBeenCalledTimes(2)
    })
})

describe('React Strict Mode', () => {
    it('applies one result and reports no error, though the first mount is torn down', async () => {
        const fetcher = fetcherFor(tablePayload())

        const { container } = render(
            <StrictMode>
                <MeTable endpoint="/table" fetcher={fetcher} syncUrl={false} />
            </StrictMode>,
        )

        await settle()

        /*
         * AC-03. Strict Mode mounts, tears down and remounts, which aborts the
         * first request — so the fetcher is entered twice and exactly one result
         * is applied. What must not happen is a duplicated payload, a lost one,
         * or an error surfaced from the abort.
         */
        expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
        expect(container.querySelector('.me-alert--danger')).toBeNull()
        expect(container.textContent).toContain('Showing 1–2 of 2')
    })
})
