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
import { computed, onMounted, onUnmounted, shallowRef, type ComputedRef, type ShallowRef } from 'vue'

/**
 * The table's state machine, as Vue reactivity.
 *
 * The machine itself lives in @my-eyes/core — fetching, the page cache,
 * request ordering and the URL sync are the same code the React package runs.
 * This only makes it reactive and ties it to the component lifecycle.
 *
 * Use it directly when the table's presentation is your own; MeTable is this
 * plus the markup.
 *
 * @see docs/features/vue-package.md
 */
export interface UseTable {
    state: ShallowRef<TableState>
    rows: ComputedRef<TableRow[]>
    columns: ComputedRef<TableColumn[]>
    pagination: ComputedRef<TablePagination | null>
    schema: ComputedRef<FilterFieldSchema[]>
    sort: ComputedRef<{ key: string | null; direction: 'asc' | 'desc' }>
    search: ComputedRef<string>
    filters: ComputedRef<{ conditions: FilterCondition[]; conjunction: 'and' | 'or' }>
    perPageOptions: ComputedRef<number[]>
    /** True only while a request is in flight; a cache hit never sets it. */
    loading: ComputedRef<boolean>
    error: ComputedRef<string | null>
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
    const client = createTableClient(options)
    const state = shallowRef<TableState>(client.getState())

    let unsubscribe: (() => void) | null = null

    onMounted(() => {
        unsubscribe = client.subscribe((next) => {
            state.value = next
        })

        client.start()
    })

    onUnmounted(() => {
        unsubscribe?.()
        client.destroy()
    })

    const payload = computed(() => state.value.payload)

    return {
        state,
        rows: computed(() => payload.value?.rows ?? []),
        columns: computed(() => payload.value?.columns ?? []),
        pagination: computed(() => payload.value?.pagination ?? null),
        schema: computed(() => payload.value?.schema ?? []),
        sort: computed(() => payload.value?.sort ?? { key: null, direction: 'asc' as const }),
        search: computed(() => payload.value?.search ?? ''),
        filters: computed(() => payload.value?.filters ?? { conditions: [], conjunction: 'and' as const }),
        perPageOptions: computed(() => payload.value?.perPageOptions ?? []),
        loading: computed(() => state.value.status === 'loading'),
        error: computed(() => state.value.error),
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
