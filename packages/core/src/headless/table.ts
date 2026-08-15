/*
 * The client side of the table payload contract.
 *
 * Framework-free on purpose: the Vue and React tables are thin reactive
 * wrappers around this, so the fetching, the page cache, the request ordering
 * and the URL syncing exist once rather than twice.
 *
 * The server remains the authority. What is displayed always comes from the
 * last payload, never from what the client just asked for — so when the server
 * rejects a sort or a page size, the controls follow the server rather than
 * lying about it.
 *
 * @see docs/policies/table-payload.md
 */

import type { FilterCondition, FilterFieldSchema } from './filters.js'

export interface TableColumn {
    key: string
    label: string
    align: 'start' | 'center' | 'end'
    sortable: boolean
    searchable: boolean
    filterable: boolean
    /** When true, the client must render this column's values as markup. */
    html: boolean
}

export interface TablePagination {
    page: number
    perPage: number
    total: number
    lastPage: number
    from: number | null
    to: number | null
}

export type TableRow = Record<string, unknown>

export interface TablePayload {
    columns: TableColumn[]
    rows: TableRow[]
    sort: { key: string | null; direction: 'asc' | 'desc' }
    search: string
    filters: { conditions: FilterCondition[]; conjunction: 'and' | 'or' }
    schema: FilterFieldSchema[]
    pagination: TablePagination
    perPageOptions: number[]
}

/** What the client asks for. What it gets back is the payload. */
export interface TableQuery {
    sort: string
    direction: 'asc' | 'desc'
    search: string
    perPage: number | null
    page: number
    conditions: FilterCondition[]
    conjunction: 'and' | 'or'
}

export type TableStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface TableState {
    status: TableStatus
    /** The last successful payload. Kept through a failure, so rows stay put. */
    payload: TablePayload | null
    error: string | null
}

export interface TableClientOptions {
    endpoint: string
    /** Matches Table::name() on the server; prefixes every query string key. */
    name?: string | null
    /** Writes the applied state to the address bar. */
    syncUrl?: boolean
    /** Injected in tests, and for applications with their own HTTP wrapper. */
    fetcher?: typeof fetch
}

export interface TableClient {
    getState(): TableState
    subscribe(listener: (state: TableState) => void): () => void
    /** Fetches the first page. Safe to call twice — React Strict Mode does. */
    start(): void
    goToPage(page: number): void
    setSearch(search: string): void
    setPerPage(perPage: number): void
    /** Sorts by a column, toggling direction when it is already the active one. */
    toggleSort(key: string): void
    setFilters(conditions: FilterCondition[], conjunction: 'and' | 'or'): void
    /** Re-fetches the current page, ignoring the cache. */
    refresh(): void
    retry(): void
    destroy(): void
}

const DEFAULT_QUERY: TableQuery = {
    sort: '',
    direction: 'asc',
    search: '',
    perPage: null,
    page: 1,
    conditions: [],
    conjunction: 'and',
}

export function createTableClient(options: TableClientOptions): TableClient {
    const { endpoint, name = null, syncUrl = true } = options
    const request = options.fetcher ?? ((...args: Parameters<typeof fetch>) => fetch(...args))

    const key = (parameter: string): string => (name === null ? parameter : `${name}_${parameter}`)

    let query: TableQuery = { ...DEFAULT_QUERY, ...readQueryFromUrl(key) }
    let state: TableState = { status: 'idle', payload: null, error: null }

    /*
     * Pages already fetched, keyed by page number. Dropped whole whenever sort,
     * search, filters or page size change, because those invalidate every page,
     * not just the current one.
     */
    let cache = new Map<number, TablePayload>()

    const listeners = new Set<(state: TableState) => void>()
    let controller: AbortController | null = null
    /*
     * Only the newest request may write to the state. Without this, paging
     * quickly from 1 to 5 renders whichever response happens to land last.
     */
    let latest = 0
    let inFlight = false

    const emit = (next: Partial<TableState>): void => {
        state = { ...state, ...next }
        listeners.forEach((listener) => listener(state))
    }

    const load = (options: { cached?: boolean } = {}): void => {
        const useCache = options.cached !== false
        const hit = useCache ? cache.get(query.page) : undefined

        // A cache hit never passes through "loading" — that is the whole point.
        if (hit) {
            emit({ status: 'ready', payload: hit, error: null })
            writeUrl(hit)

            return
        }

        controller?.abort()
        controller = new AbortController()

        const ticket = ++latest

        inFlight = true
        emit({ status: 'loading', error: null })

        request(`${endpoint}${endpoint.includes('?') ? '&' : '?'}${buildQueryString(query, key)}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`${response.status} ${response.statusText}`.trim())
                }

                return (await response.json()) as TablePayload
            })
            .then((payload) => {
                // A superseded request must not overwrite a newer one's result.
                if (ticket !== latest) {
                    return
                }

                inFlight = false
                cache.set(payload.pagination.page, payload)
                emit({ status: 'ready', payload, error: null })
                writeUrl(payload)
            })
            .catch((error: unknown) => {
                if (ticket !== latest) {
                    return
                }

                inFlight = false

                if (isAbort(error)) {
                    return
                }

                // The previous payload stays on screen: an error should not
                // blank the table the user was reading.
                emit({ status: 'error', error: message(error) })
            })
    }

    const writeUrl = (payload: TablePayload): void => {
        if (!syncUrl || typeof window === 'undefined') {
            return
        }

        const url = new URL(window.location.href)

        applyToParams(url.searchParams, payload, key)
        window.history.replaceState(window.history.state, '', url.toString())
    }

    /* Every one of these invalidates every cached page, and resets to page 1. */
    const restart = (change: Partial<TableQuery>): void => {
        query = { ...query, ...change, page: 1 }
        cache = new Map()
        load()
    }

    return {
        getState: () => state,

        subscribe(listener) {
            listeners.add(listener)

            return () => listeners.delete(listener)
        },

        start() {
            /*
             * Idempotent, and deliberately phrased as "nothing to show and
             * nothing on its way" rather than "status is idle": React Strict
             * Mode mounts, tears down and remounts, which aborts the first
             * request. Keying off the status alone would leave the table stuck
             * on a request that was cancelled.
             */
            if (state.payload === null && !inFlight) {
                load()
            }
        },

        goToPage(page) {
            query = { ...query, page: Math.max(1, Math.trunc(page)) }
            load()
        },

        setSearch(search) {
            restart({ search })
        },

        setPerPage(perPage) {
            restart({ perPage })
        },

        toggleSort(sortKey) {
            const active = query.sort === sortKey

            restart({
                sort: sortKey,
                direction: active && query.direction === 'asc' ? 'desc' : 'asc',
            })
        },

        setFilters(conditions, conjunction) {
            restart({ conditions, conjunction: conjunction === 'or' ? 'or' : 'and' })
        },

        refresh() {
            cache = new Map()
            load({ cached: false })
        },

        retry() {
            load({ cached: false })
        },

        /**
         * Aborts what is in flight and drops the listeners. The client stays
         * usable: a component that unmounts and mounts again — which is
         * exactly what React Strict Mode does — resubscribes and carries on.
         */
        destroy() {
            controller?.abort()
            inFlight = false
            listeners.clear()
        },
    }
}

/**
 * The query string the server reads — the same keys the Blade table uses.
 */
export function buildQueryString(query: TableQuery, key: (parameter: string) => string): string {
    const params = new URLSearchParams()

    if (query.sort !== '') {
        params.set(key('sort'), query.sort)
        params.set(key('direction'), query.direction)
    }

    if (query.search !== '') {
        params.set(key('q'), query.search)
    }

    if (query.perPage !== null) {
        params.set(key('per_page'), String(query.perPage))
    }

    if (query.page > 1) {
        params.set(key('page'), String(query.page))
    }

    query.conditions.forEach((condition, index) => {
        params.set(`${key('filters')}[${index}][field]`, condition.field)
        params.set(`${key('filters')}[${index}][operator]`, condition.operator)

        condition.values.forEach((value, position) => {
            params.set(`${key('filters')}[${index}][values][${position}]`, value)
        })
    })

    if (query.conditions.length > 0 && query.conjunction === 'or') {
        params.set(key('conjunction'), 'or')
    }

    return params.toString()
}

/**
 * The state a shared URL carries, so the first render is already sorted,
 * searched and filtered rather than flashing an unfiltered page first.
 */
export function readQueryFromUrl(key: (parameter: string) => string): Partial<TableQuery> {
    if (typeof window === 'undefined') {
        return {}
    }

    const params = new URLSearchParams(window.location.search)
    const read: Partial<TableQuery> = {}

    const sort = params.get(key('sort'))
    if (sort) {
        read.sort = sort
        read.direction = params.get(key('direction')) === 'desc' ? 'desc' : 'asc'
    }

    const search = params.get(key('q'))
    if (search) {
        read.search = search
    }

    const perPage = Number(params.get(key('per_page')))
    if (Number.isFinite(perPage) && perPage > 0) {
        read.perPage = perPage
    }

    const page = Number(params.get(key('page')))
    if (Number.isFinite(page) && page > 1) {
        read.page = page
    }

    const conditions = readConditions(params, key)
    if (conditions.length > 0) {
        read.conditions = conditions
        read.conjunction = params.get(key('conjunction')) === 'or' ? 'or' : 'and'
    }

    return read
}

function readConditions(params: URLSearchParams, key: (parameter: string) => string): FilterCondition[] {
    const rows = new Map<number, FilterCondition>()
    const pattern = new RegExp(`^${escapeRegExp(key('filters'))}\\[(\\d+)\\]\\[(field|operator|values)\\](?:\\[(\\d+)\\])?$`)

    params.forEach((value, name) => {
        const match = pattern.exec(name)

        if (!match) {
            return
        }

        const index = Number(match[1])
        const row = rows.get(index) ?? { field: '', operator: '', values: [] }

        if (match[2] === 'field') {
            row.field = value
        } else if (match[2] === 'operator') {
            row.operator = value
        } else {
            row.values[Number(match[3] ?? 0)] = value
        }

        rows.set(index, row)
    })

    return [...rows.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, row]) => ({ ...row, values: [...row.values].map((value) => value ?? '') }))
        .filter((row) => row.field !== '' && row.operator !== '')
}

/**
 * Mirrors the *applied* state into the address bar. Applied rather than
 * requested, so a shared link reproduces what the sender actually saw.
 */
function applyToParams(params: URLSearchParams, payload: TablePayload, key: (parameter: string) => string): void {
    const drop = (parameter: string): void => params.delete(key(parameter))

    ;['sort', 'direction', 'q', 'per_page', 'page', 'conjunction'].forEach(drop)

    // Filters are indexed, so there is no single key to delete.
    ;[...params.keys()]
        .filter((name) => name.startsWith(`${key('filters')}[`))
        .forEach((name) => params.delete(name))

    if (payload.sort.key !== null) {
        params.set(key('sort'), payload.sort.key)
        params.set(key('direction'), payload.sort.direction)
    }

    if (payload.search !== '') {
        params.set(key('q'), payload.search)
    }

    params.set(key('per_page'), String(payload.pagination.perPage))

    if (payload.pagination.page > 1) {
        params.set(key('page'), String(payload.pagination.page))
    }

    payload.filters.conditions.forEach((condition, index) => {
        params.set(`${key('filters')}[${index}][field]`, condition.field)
        params.set(`${key('filters')}[${index}][operator]`, condition.operator)

        condition.values.forEach((value, position) => {
            params.set(`${key('filters')}[${index}][values][${position}]`, value)
        })
    })

    if (payload.filters.conditions.length > 0 && payload.filters.conjunction === 'or') {
        params.set(key('conjunction'), 'or')
    }
}

function isAbort(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError'
}

function message(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
