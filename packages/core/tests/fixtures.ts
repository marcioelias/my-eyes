import type { TablePayload } from '../src/index.js'

/**
 * The payload fixture both renderers are tested against.
 *
 * Shared on purpose: AC-02 of `docs/features/react-package.md` is that the Vue
 * and React tables produce equivalent markup for the *same* fixture, and two
 * copies of a fixture cannot prove that.
 */
export const tablePayload = (overrides: Partial<TablePayload> = {}): TablePayload => ({
    columns: [
        { key: 'name', label: 'Name', align: 'start', sortable: true, searchable: true, filterable: false, html: false },
        { key: 'status', label: 'Status', align: 'end', sortable: false, searchable: false, filterable: false, html: false },
    ],
    rows: [
        { name: 'Ana Souza', status: 'active' },
        { name: 'Bruno Lima', status: 'banned' },
    ],
    sort: { key: null, direction: 'asc' },
    search: '',
    filters: { conditions: [], conjunction: 'and' },
    schema: [],
    pagination: { page: 1, perPage: 25, total: 2, lastPage: 1, from: 1, to: 2 },
    perPageOptions: [10, 25, 50],
    ...overrides,
})

/** A fetch response carrying a payload, with only what the client reads. */
export const respondWith = (body: TablePayload): Response =>
    ({ ok: true, status: 200, statusText: 'OK', json: async () => body }) as unknown as Response

/** Two macrotask turns: enough for the client's fetch and its state emit. */
export const settle = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))
}
