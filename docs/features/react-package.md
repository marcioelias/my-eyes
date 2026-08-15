# React renderer

Status: draft

## Purpose

`@my-eyes/react` — the same components and the same table as the Vue renderer,
for React 19 frontends.

## Actors

Application developers building a React frontend against a Laravel backend,
with or without Inertia.

## Business Rules

- **BR-01 — Parity.** Every rule in `features/vue-package.md` (BR-01 to BR-14)
  applies here unchanged, with `React` substituted for `Vue`. The two renderers
  are the same feature expressed twice; a rule that holds in one and not the
  other is a defect in whichever is behind.
- **BR-02** — Both renderers speak `policies/table-payload.md`. Neither extends
  it privately.
- **BR-03** — `react` and `@my-eyes/core` are peer dependencies. No runtime
  dependency of its own; in particular no virtualisation library — the row
  windowing is small enough to own, and a shared implementation lives in core.
- **BR-04** — Components are function components with `forwardRef` where a DOM
  handle is meaningful (inputs, buttons, the table viewport).
- **BR-05** — Where Vue uses scoped slots, React uses render props
  (`renderCell`), and where Vue uses composables, React uses hooks. That is the
  only intended difference between the packages.
- **BR-06** — Every component is client-side. Components that touch the DOM
  carry `'use client'`, so the package can be consumed from a React Server
  Components tree without breaking the build.

## Data

New package: `packages/react`, published as `@my-eyes/react`.

| Export | Vue equivalent |
|---|---|
| `MeButton`, `MeInput`, `MeSelect`, … | same names |
| `MeTable`, `MeFilters` | same names |
| `useTable(options)` | `useTable(options)` |
| `useToasts()` | `useToasts()` |

## Contracts

```tsx
import { MeTable, MeBadge } from '@my-eyes/react'

<MeTable
    endpoint="/users/table"
    renderCell={{
        status: (value) => (
            <MeBadge variant={value === 'active' ? 'success' : 'danger'}>
                {value}
            </MeBadge>
        ),
    }}
/>
```

```ts
const { rows, columns, pagination, loading, error, sort, setSearch, goToPage } =
    useTable({ endpoint: '/users/table' })
```

Props match `MeTable` in `features/vue-package.md` exactly.

## States

Identical to `features/vue-package.md`.

## Acceptance Criteria

- **AC-01** — AC-01 to AC-10 of `features/vue-package.md` hold for the React
  components, with `renderCell` in place of the `cell:<key>` slot in AC-09.
- **AC-02** — Given the shared payload fixtures, when both suites run, then the
  Vue and React tables produce equivalent markup for the same fixture.
- **AC-03** — Given React Strict Mode, when the table mounts, then the double
  invocation causes neither a duplicate request nor a cache inconsistency.

## Out of Scope

Same as `features/vue-package.md`, plus:

- React Server Components rendering of the table itself (BR-06 only guarantees
  the package does not break such a build)
- React 18 and earlier

## Open Questions

None blocking.
