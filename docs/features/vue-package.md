# Vue renderer

Status: draft

## Purpose

`@my-eyes/vue` — my-eyes components as Vue 3 SFCs, so a Vue frontend gets the
same design system and the same table without reimplementing either.

## Actors

Application developers building a Vue 3 frontend against a Laravel backend,
with or without Inertia.

## Business Rules

### Components

- **BR-01** — Every component emits the same `me-*` classes the Blade
  equivalent emits. No component carries styling of its own, and none ships
  scoped CSS. `@my-eyes/core/css` remains the only stylesheet.
- **BR-02** — Behaviour comes from `@my-eyes/core`'s `headless/` modules. A
  component wires a headless model to Vue reactivity; it does not restate the
  logic. Where no headless model exists yet, one is added to core rather than
  written inside the component.
- **BR-03** — `@my-eyes/core` is a peer dependency, as is `vue`. The package
  ships no runtime dependency of its own.
- **BR-04** — Components are individually importable and side-effect free, so
  a consumer bundles only what is used.
- **BR-05** — Translations come from the same message catalogue the core uses
  (`headless/i18n`), seeded by the host application. No strings are hardcoded
  in a component.

### Table

- **BR-06** — The table paginates **on the server**, over the payload contract
  in `policies/table-payload.md`. Client-side caching and virtualisation are
  responsiveness measures layered on top; neither replaces server pagination.
- **BR-07** — A page already fetched is served from an in-memory cache when the
  user returns to it, without a request.
- **BR-08** — The cache is keyed by the full query state — sort, direction,
  search, filters, conjunction, page size. Any change to that state drops the
  whole cache, because it invalidates every page.
- **BR-09** — Rows are virtualised: only rows within the viewport, plus a small
  overscan, are in the DOM.
- **BR-10** — Virtualisation never changes what a screen reader or a keyboard
  user can reach in the current page: the scroll container is the table
  viewport, row semantics are preserved, and total row count is announced.
- **BR-11** — Table state is written to `history` using the query string keys
  from `policies/table-payload.md`, so a table URL is shareable and the back
  button moves through table state as a user expects.
- **BR-12** — A request superseded by a newer one is aborted, and its response
  is discarded if it still arrives. The rendered page is always the requested
  page.
- **BR-13** — A failed request leaves the previous rows on screen, surfaces a
  retryable error, and does not poison the cache.
- **BR-14** — Cell values are rendered as text unless the payload marks the
  column `html` (`policies/table-payload.md`, P-06/P-07). Consumers may
  override any cell with a scoped slot, which is the supported way to render
  a badge, a link or an action column.

## Data

New package: `packages/vue`, published as `@my-eyes/vue`.

| Export | Purpose |
|---|---|
| `MeButton`, `MeInput`, `MeSelect`, `MeField`, … | Form and UI components |
| `MeTable` | The data table |
| `MeFilters` | The filter builder |
| `MeModal`, `MeToasts`, `MeTooltip`, `MeDropdown` | Overlays |
| `useTable(options)` | The table's state machine, usable without `MeTable` |
| `useToasts()` | Programmatic toasts |

## Contracts

```vue
<script setup lang="ts">
import { MeTable } from '@my-eyes/vue'
</script>

<template>
  <MeTable endpoint="/users/table">
    <template #cell:status="{ value }">
      <MeBadge :variant="value === 'active' ? 'success' : 'danger'">
        {{ value }}
      </MeBadge>
    </template>
  </MeTable>
</template>
```

`useTable` for a custom presentation:

```ts
const { rows, columns, pagination, loading, error, sort, setSearch, goToPage } =
    useTable({ endpoint: '/users/table' })
```

Props of `MeTable`:

| Prop | Default | Meaning |
|---|---|---|
| `endpoint` | required | URL serving the payload |
| `name` | `null` | Query string prefix, matching `Table::name()` |
| `syncUrl` | `true` | Write state to `history` (BR-11) |
| `rowHeight` | `44` | Estimated row height for virtualisation |
| `overscan` | `8` | Rows rendered beyond the viewport |
| `striped`, `compact` | `false` | Visual variants, same classes as Blade |

## States

```
        ┌──────────┐  fetch   ┌──────────┐  ok    ┌────────┐
        │  idle    │─────────▶│ loading  │───────▶│ ready  │
        └──────────┘          └──────────┘        └────────┘
                                   │  fail            │
                                   ▼                  │ state change
                              ┌────────┐              │ (drops cache)
                              │ error  │◀─────────────┘
                              └────────┘
                                   │ retry
                                   └──────▶ loading
```

A cache hit goes `idle → ready` with no `loading` state, which is the point of
BR-07.

## Acceptance Criteria

- **AC-01** — Given a rendered `MeTable`, when a sortable header is clicked,
  then the payload is re-fetched sorted, and the URL carries `sort` and
  `direction`.
- **AC-02** — Given the user has visited pages 1 and 2, when they return to
  page 1, then no request is made and rows appear in the same frame.
- **AC-03** — Given cached pages, when the search term changes, then the cache
  is empty and page 1 is fetched.
- **AC-04** — Given a page size of 100, when the table renders, then the DOM
  holds only the visible rows plus the overscan, and scrolling reveals the rest
  without a request.
- **AC-05** — Given the user pages quickly from 1 to 5, when the responses
  arrive out of order, then page 5 is displayed.
- **AC-06** — Given an endpoint returning 500, when a page is requested, then
  the previous rows remain, an error with a retry action is shown, and a retry
  that succeeds renders normally.
- **AC-07** — Given a URL carrying table state, when the page loads, then the
  table renders that state without a flash of unsorted, unfiltered rows.
- **AC-08** — Given a column not marked `html`, when a value contains
  `<script>`, then it renders as visible text.
- **AC-09** — Given a `cell:<key>` slot, when the table renders, then that
  slot replaces the default cell for that column only.
- **AC-10** — Given the server rejects a requested sort column, when the
  payload returns, then the header reflects the sort the server applied
  (`policies/table-payload.md`, P-03).

## Out of Scope

- SSR of the table's first page — the component fetches on mount
- Infinite scroll as a paging mode
- Row selection and bulk actions
- Vue 2

## Open Questions

None blocking.
