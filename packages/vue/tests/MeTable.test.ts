import type { TablePayload } from '@my-eyes/core'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MeTable } from '../src/MeTable.js'
import { respondWith, settle, tablePayload } from '../../core/tests/fixtures.js'

/**
 * The Vue table against real payloads.
 *
 * @see docs/features/vue-package.md
 * @see docs/policies/table-payload.md
 */

const payload = tablePayload

const respond = respondWith

const fetcherFor = (body: TablePayload | (() => TablePayload)) =>
    vi.fn(async () => respond(typeof body === 'function' ? body() : body))

beforeEach(() => {
    window.history.replaceState({}, '', '/records')
})

describe('rendering', () => {
    it('renders the headers and rows the payload describes', async () => {
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(payload()), syncUrl: false },
        })

        await settle()

        expect(wrapper.findAll('thead th').map((th) => th.text())).toEqual(['Name', 'Status'])
        expect(wrapper.findAll('tbody tr')).toHaveLength(2)
        expect(wrapper.text()).toContain('Ana Souza')
    })

    it('carries the column alignment through to the cells', async () => {
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(payload()), syncUrl: false },
        })

        await settle()

        expect(wrapper.findAll('tbody td')[1]?.classes()).toContain('me-table__cell--end')
    })

    it('shows the empty state when there are no rows', async () => {
        const wrapper = mount(MeTable, {
            props: {
                endpoint: '/table',
                fetcher: fetcherFor(
                    payload({ rows: [], pagination: { page: 1, perPage: 25, total: 0, lastPage: 1, from: null, to: null } }),
                ),
                syncUrl: false,
            },
        })

        await settle()

        expect(wrapper.find('.me-empty').exists()).toBe(true)
    })
})

describe('cell values', () => {
    it('renders an unmarked value as text, whatever it contains', async () => {
        const wrapper = mount(MeTable, {
            props: {
                endpoint: '/table',
                fetcher: fetcherFor(payload({ rows: [{ name: '<script>alert(1)</script>', status: 'active' }] })),
                syncUrl: false,
            },
        })

        await settle()

        expect(wrapper.find('tbody td')?.element.querySelector('script')).toBeNull()
        expect(wrapper.find('tbody td').text()).toContain('<script>')
    })

    it('renders markup only for a column the server marked html', async () => {
        const columns = payload().columns.map((column) =>
            column.key === 'status' ? { ...column, html: true } : column,
        )

        const wrapper = mount(MeTable, {
            props: {
                endpoint: '/table',
                fetcher: fetcherFor(
                    payload({ columns, rows: [{ name: '<b>plain</b>', status: '<b>bold</b>' }] }),
                ),
                syncUrl: false,
            },
        })

        await settle()

        const cells = wrapper.findAll('tbody td')

        expect(cells[0]?.element.querySelector('b')).toBeNull()
        expect(cells[1]?.element.querySelector('b')?.textContent).toBe('bold')
    })

    it('lets a slot replace one column only', async () => {
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(payload()), syncUrl: false },
            slots: {
                'cell:status': (scope: { value: unknown }) => h('span', { class: 'custom' }, String(scope.value)),
            },
        })

        await settle()

        expect(wrapper.findAll('.custom')).toHaveLength(2)
        expect(wrapper.findAll('tbody td')[0]?.text()).toBe('Ana Souza')
    })
})

describe('sorting', () => {
    it('asks the server to sort when a sortable header is clicked', async () => {
        const fetcher = fetcherFor(payload())
        const wrapper = mount(MeTable, { props: { endpoint: '/table', fetcher, syncUrl: false } })

        await settle()
        await wrapper.find('thead button').trigger('click')
        await settle()

        expect(fetcher.mock.calls[1]?.[0]).toContain('sort=name')
        expect(fetcher.mock.calls[1]?.[0]).toContain('direction=asc')
    })

    it('gives no sort control to a column that is not sortable', async () => {
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(payload()), syncUrl: false },
        })

        await settle()

        expect(wrapper.findAll('thead button')).toHaveLength(1)
    })

    it('reflects the sort the server applied, not the one requested', async () => {
        // Asked for "name"; the server answered with no sort at all.
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(payload()), syncUrl: false },
        })

        await settle()
        await wrapper.find('thead button').trigger('click')
        await settle()

        expect(wrapper.find('thead th').attributes('aria-sort')).toBeUndefined()
    })
})

describe('paging', () => {
    it('renders no pagination for a single page', async () => {
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(payload()), syncUrl: false },
        })

        await settle()

        expect(wrapper.find('.me-pagination').exists()).toBe(false)
    })

    it('fetches the page the user asked for', async () => {
        const fetcher = fetcherFor(() =>
            payload({ pagination: { page: 1, perPage: 25, total: 80, lastPage: 4, from: 1, to: 25 } }),
        )

        const wrapper = mount(MeTable, { props: { endpoint: '/table', fetcher, syncUrl: false } })
        await settle()

        const pages = wrapper.findAll('.me-pagination__item--number')
        expect(pages.map((button) => button.text())).toEqual(['1', '2', '4'])

        await pages[1]!.trigger('click')
        await settle()

        expect(fetcher.mock.calls[1]?.[0]).toContain('page=2')
    })

    it('offers the page sizes the server declared', async () => {
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(payload()), syncUrl: false },
        })

        await settle()

        expect(wrapper.findAll('option').map((option) => option.text())).toEqual(['10', '25', '50'])
        expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('25')
    })
})

describe('failure', () => {
    it('keeps the rows and offers a retry', async () => {
        let fail = false
        const fetcher = vi.fn(async () => {
            if (fail) {
                return { ok: false, status: 500, statusText: 'Server Error' } as unknown as Response
            }

            return respond(payload({ pagination: { page: 1, perPage: 25, total: 80, lastPage: 4, from: 1, to: 25 } }))
        })

        const wrapper = mount(MeTable, { props: { endpoint: '/table', fetcher, syncUrl: false } })
        await settle()

        fail = true
        await wrapper.findAll('.me-pagination__item--number')[1]!.trigger('click')
        await settle()

        expect(wrapper.find('[role="alert"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('Ana Souza')

        fail = false
        await wrapper.find('[role="alert"] button').trigger('click')
        await settle()

        expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })
})

describe('searching', () => {
    it('debounces the search into one request', async () => {
        vi.useFakeTimers()

        try {
            const fetcher = fetcherFor(payload())
            const wrapper = mount(MeTable, {
                props: { endpoint: '/table', fetcher, syncUrl: false, searchDebounce: 200 },
            })

            await vi.advanceTimersByTimeAsync(1)

            const input = wrapper.find('input[type="search"]')
            await input.setValue('a')
            await input.setValue('an')
            await input.setValue('ana')

            await vi.advanceTimersByTimeAsync(250)

            expect(fetcher).toHaveBeenCalledTimes(2)
            expect(fetcher.mock.calls[1]?.[0]).toContain('q=ana')
        } finally {
            vi.useRealTimers()
        }
    })
})

describe('row windowing', () => {
    const manyRows = (count: number): TablePayload =>
        payload({
            rows: Array.from({ length: count }, (_, index) => ({ name: `Person ${index}`, status: 'active' })),
            pagination: { page: 1, perPage: count, total: count, lastPage: 1, from: 1, to: count },
        })

    it('renders a short page in full', async () => {
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(manyRows(20)), syncUrl: false },
        })

        await settle()

        expect(wrapper.findAll('tbody tr')).toHaveLength(20)
    })

    it('renders every row while the viewport has no measured height', async () => {
        // jsdom lays nothing out, so clientHeight is 0 — the same situation as
        // the first frame before layout. Rendering nothing then would paint an
        // empty table.
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(manyRows(200)), syncUrl: false },
        })

        await settle()

        expect(wrapper.findAll('tbody tr')).toHaveLength(200)
    })

    it('windows the rows once the viewport has a height', async () => {
        const wrapper = mount(MeTable, {
            props: { endpoint: '/table', fetcher: fetcherFor(manyRows(200)), syncUrl: false, rowHeight: 40, overscan: 5 },
        })

        await settle()

        const viewport = wrapper.find('.me-table-viewport').element
        Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 400 })
        await wrapper.find('.me-table-viewport').trigger('scroll')
        await settle()

        // 10 visible + 5 overscan each side, plus the two spacer rows.
        expect(wrapper.findAll('tbody tr')).toHaveLength(21)
        expect(wrapper.find('tbody tr[aria-hidden="true"]').exists()).toBe(true)
    })
})
