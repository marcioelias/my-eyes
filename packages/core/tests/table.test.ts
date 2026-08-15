import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQueryString, createTableClient, readQueryFromUrl, type TablePayload } from '../src/headless/table.js'

/**
 * The client half of the payload contract.
 *
 * @see docs/policies/table-payload.md
 * @see docs/features/vue-package.md
 */

const payload = (page: number, overrides: Partial<TablePayload> = {}): TablePayload => ({
    columns: [
        { key: 'name', label: 'Name', align: 'start', sortable: true, searchable: true, filterable: false, html: false },
    ],
    rows: [{ name: `Row on page ${page}` }],
    sort: { key: null, direction: 'asc' },
    search: '',
    filters: { conditions: [], conjunction: 'and' },
    schema: [],
    pagination: { page, perPage: 25, total: 100, lastPage: 4, from: 1, to: 25 },
    perPageOptions: [10, 25, 50, 100],
    ...overrides,
})

const respond = (body: TablePayload): Response =>
    ({ ok: true, status: 200, statusText: 'OK', json: async () => body }) as unknown as Response

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

beforeEach(() => {
    window.history.replaceState({}, '', '/records')
})

describe('fetching', () => {
    it('fetches the first page on start', async () => {
        const fetcher = vi.fn(async () => respond(payload(1)))
        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        client.start()
        await settle()

        expect(fetcher).toHaveBeenCalledTimes(1)
        expect(client.getState().status).toBe('ready')
        expect(client.getState().payload?.rows).toEqual([{ name: 'Row on page 1' }])
    })

    it('does not fetch twice when start is called twice', async () => {
        // React Strict Mode mounts every component twice.
        const fetcher = vi.fn(async () => respond(payload(1)))
        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        client.start()
        client.start()
        await settle()

        expect(fetcher).toHaveBeenCalledTimes(1)
    })
})

describe('the page cache', () => {
    it('serves a page it already fetched without a request', async () => {
        const fetcher = vi.fn(async (url: string) => respond(payload(url.includes('page=2') ? 2 : 1)))
        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        client.start()
        await settle()

        client.goToPage(2)
        await settle()
        expect(fetcher).toHaveBeenCalledTimes(2)

        client.goToPage(1)
        // No await: a cache hit is synchronous, which is the whole point.
        expect(client.getState().status).toBe('ready')
        expect(client.getState().payload?.pagination.page).toBe(1)
        expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('never enters loading on a cache hit', async () => {
        const fetcher = vi.fn(async (url: string) => respond(payload(url.includes('page=2') ? 2 : 1)))
        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        client.start()
        await settle()
        client.goToPage(2)
        await settle()

        const seen: string[] = []
        client.subscribe((state) => seen.push(state.status))
        client.goToPage(1)

        expect(seen).toEqual(['ready'])
    })

    it('drops every cached page when the search changes', async () => {
        const fetcher = vi.fn(async (url: string) => respond(payload(url.includes('page=2') ? 2 : 1)))
        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        client.start()
        await settle()
        client.goToPage(2)
        await settle()
        expect(fetcher).toHaveBeenCalledTimes(2)

        // Searching re-fetches page 1, so only page 2 still proves the point:
        // it was cached before the search, and must not be reused after it.
        client.setSearch('ana')
        await settle()
        expect(fetcher).toHaveBeenCalledTimes(3)

        client.goToPage(2)
        await settle()
        expect(fetcher).toHaveBeenCalledTimes(4)
    })

    it('drops the cache when the sort or the page size changes', async () => {
        const fetcher = vi.fn(async (url: string) => respond(payload(url.includes('page=2') ? 2 : 1)))
        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        const cachePageTwo = async (): Promise<void> => {
            client.goToPage(2)
            await settle()
        }

        client.start()
        await settle()
        await cachePageTwo()

        client.toggleSort('name')
        await settle()
        await cachePageTwo()

        client.setPerPage(50)
        await settle()
        await cachePageTwo()

        // Six requests: page 1 and page 2, three times over.
        expect(fetcher).toHaveBeenCalledTimes(6)
    })
})

describe('request ordering', () => {
    it('renders the newest request, whatever order the responses land in', async () => {
        const fetcher = vi.fn(async (url: string) => {
            const page = Number(/page=(\d+)/.exec(url)?.[1] ?? 1)

            // The first page requested answers last.
            await new Promise((resolve) => setTimeout(resolve, page === 2 ? 30 : 1))

            return respond(payload(page))
        })

        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        client.start()
        await settle()

        client.goToPage(2)
        client.goToPage(5)

        await new Promise((resolve) => setTimeout(resolve, 60))

        expect(client.getState().payload?.pagination.page).toBe(5)
    })
})

describe('failure', () => {
    it('keeps the rows on screen and offers a retry', async () => {
        let fail = false
        const fetcher = vi.fn(async () => {
            if (fail) {
                return { ok: false, status: 500, statusText: 'Server Error' } as unknown as Response
            }

            return respond(payload(1))
        })

        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        client.start()
        await settle()

        fail = true
        client.goToPage(3)
        await settle()

        expect(client.getState().status).toBe('error')
        expect(client.getState().error).toContain('500')
        // The table the user was reading is still there.
        expect(client.getState().payload?.rows).toEqual([{ name: 'Row on page 1' }])

        fail = false
        client.retry()
        await settle()

        expect(client.getState().status).toBe('ready')
    })

    it('does not cache a failed page', async () => {
        let fail = true
        const fetcher = vi.fn(async () => {
            if (fail) {
                return { ok: false, status: 503, statusText: '' } as unknown as Response
            }

            return respond(payload(1))
        })

        const client = createTableClient({ endpoint: '/table', fetcher, syncUrl: false })

        client.start()
        await settle()
        fail = false

        client.goToPage(1)
        await settle()

        expect(client.getState().status).toBe('ready')
    })
})

describe('the query string', () => {
    const key = (parameter: string): string => parameter

    it('sends the keys the Blade table uses', () => {
        const built = buildQueryString(
            {
                sort: 'name',
                direction: 'desc',
                search: 'ana',
                perPage: 50,
                page: 3,
                conditions: [{ field: 'status', operator: 'eq', values: ['active'] }],
                conjunction: 'or',
            },
            key,
        )

        const params = new URLSearchParams(built)

        expect(params.get('sort')).toBe('name')
        expect(params.get('direction')).toBe('desc')
        expect(params.get('q')).toBe('ana')
        expect(params.get('per_page')).toBe('50')
        expect(params.get('page')).toBe('3')
        expect(params.get('filters[0][field]')).toBe('status')
        expect(params.get('filters[0][operator]')).toBe('eq')
        expect(params.get('filters[0][values][0]')).toBe('active')
        expect(params.get('conjunction')).toBe('or')
    })

    it('leaves out everything at its default', () => {
        const built = buildQueryString(
            { sort: '', direction: 'asc', search: '', perPage: null, page: 1, conditions: [], conjunction: 'and' },
            key,
        )

        expect(built).toBe('')
    })

    it('prefixes every key of a named table', () => {
        const built = buildQueryString(
            {
                sort: 'name',
                direction: 'asc',
                search: 'ana',
                perPage: 10,
                page: 2,
                conditions: [{ field: 'status', operator: 'eq', values: ['active'] }],
                conjunction: 'and',
            },
            (parameter) => `users_${parameter}`,
        )

        const params = new URLSearchParams(built)

        expect(params.get('users_sort')).toBe('name')
        expect(params.get('users_page')).toBe('2')
        expect(params.get('users_filters[0][field]')).toBe('status')
    })

    it('restores state from a shared URL', () => {
        window.history.replaceState(
            {},
            '',
            '/records?sort=name&direction=desc&q=ana&per_page=50&page=2'
                + '&filters[0][field]=status&filters[0][operator]=eq&filters[0][values][0]=active&conjunction=or',
        )

        expect(readQueryFromUrl(key)).toEqual({
            sort: 'name',
            direction: 'desc',
            search: 'ana',
            perPage: 50,
            page: 2,
            conditions: [{ field: 'status', operator: 'eq', values: ['active'] }],
            conjunction: 'or',
        })
    })

    it('ignores a half-written condition in the URL', () => {
        window.history.replaceState({}, '', '/records?filters[0][field]=status')

        expect(readQueryFromUrl(key).conditions).toBeUndefined()
    })

    it('writes the state the server applied, not the state requested', async () => {
        // Asked to sort by "status"; the server sorted by nothing.
        const fetcher = vi.fn(async () => respond(payload(1, { sort: { key: null, direction: 'asc' } })))
        const client = createTableClient({ endpoint: '/table', fetcher })

        client.start()
        await settle()
        client.toggleSort('status')
        await settle()

        expect(window.location.search).not.toContain('sort=status')
        expect(window.location.search).toContain('per_page=25')
    })
})
