'use client'

import {
    createTableClient,
    type FilterCondition,
    type FilterFieldSchema,
    type TableClient,
    type TableClientOptions,
    type TableColumn,
    type TablePagination,
    type TableRow,
    type TableState,
} from '@my-eyes/core'
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

/**
 * The table's state machine, as React state.
 *
 * The machine itself lives in @my-eyes/core — fetching, the page cache, request
 * ordering and the URL sync are the same code the Vue package runs. This only
 * subscribes to it and ties it to the component lifecycle.
 *
 * Use it directly when the table's presentation is your own; MeTable is this
 * plus the markup.
 *
 * @see docs/features/react-package.md
 */
export interface UseTable {
    state: TableState
    rows: TableRow[]
    columns: TableColumn[]
    pagination: TablePagination | null
    schema: FilterFieldSchema[]
    sort: { key: string | null; direction: 'asc' | 'desc' }
    search: string
    filters: { conditions: FilterCondition[]; conjunction: 'and' | 'or' }
    perPageOptions: number[]
    /** True only while a request is in flight; a cache hit never sets it. */
    loading: boolean
    error: string | null
    client: TableClient
    goToPage: (page: number) => void
    setSearch: (search: string) => void
    setPerPage: (perPage: number) => void
    toggleSort: (key: string) => void
    setFilters: (conditions: FilterCondition[], conjunction: 'and' | 'or') => void
    refresh: () => void
    retry: () => void
}

export function useTable(options: TableClientOptions): UseTable {
    const { endpoint, name = null, syncUrl = true } = options

    /*
     * The caller's fetcher is read through a ref, so passing an inline function
     * does not rebuild the client on every render — only the endpoint, the name
     * and the URL sync do, because those change what the client *is*.
     */
    const fetcher = useRef(options.fetcher)
    fetcher.current = options.fetcher

    const client = useMemo(
        () =>
            createTableClient({
                endpoint,
                name,
                syncUrl,
                fetcher: (input, init) =>
                    (fetcher.current ?? ((...args: Parameters<typeof fetch>) => fetch(...args)))(input, init),
            }),
        [endpoint, name, syncUrl],
    )

    /*
     * useSyncExternalStore rather than useState plus an effect: the store is the
     * client, `getState()` returns a stable reference between emits, and React
     * owns the tearing-free read. It is also what makes Strict Mode's double
     * mount harmless — `start()` is idempotent and `destroy()` leaves the client
     * usable, so the remount resubscribes and carries on (AC-03).
     */
    const state = useSyncExternalStore(
        (onStoreChange) => client.subscribe(onStoreChange),
        () => client.getState(),
        () => client.getState(),
    )

    useEffect(() => {
        client.start()

        return () => client.destroy()
    }, [client])

    const payload = state.payload

    return {
        state,
        rows: payload?.rows ?? [],
        columns: payload?.columns ?? [],
        pagination: payload?.pagination ?? null,
        schema: payload?.schema ?? [],
        sort: payload?.sort ?? { key: null, direction: 'asc' },
        search: payload?.search ?? '',
        filters: payload?.filters ?? { conditions: [], conjunction: 'and' },
        perPageOptions: payload?.perPageOptions ?? [],
        loading: state.status === 'loading',
        error: state.error,
        client,
        goToPage: client.goToPage,
        setSearch: client.setSearch,
        setPerPage: client.setPerPage,
        toggleSort: client.toggleSort,
        setFilters: client.setFilters,
        refresh: client.refresh,
        retry: client.retry,
    }
}
