# Architecture

## Layers

```
                      ┌─────────────────────────────────────────┐
                      │  @my-eyes/core                          │
                      │                                         │
                      │  css/          semantic classes         │
                      │  headless/     behaviour, no DOM        │
                      │  dom/          bindings for plain HTML  │
                      └─────────────────────────────────────────┘
                          ▲          ▲            ▲          ▲
                          │          │            │          │
              ┌───────────┘   ┌──────┘      ┌─────┘     ┌────┘
              │               │             │           │
        ┌───────────┐   ┌───────────┐  ┌──────────┐ ┌──────────┐
        │  Blade    │   │ Livewire  │  │   Vue    │ │  React   │
        │  (PHP)    │   │  (PHP)    │  │   (TS)   │ │   (TS)   │
        └───────────┘   └───────────┘  └──────────┘ └──────────┘
              │               │             │           │
              └───────────────┴──────┬──────┴───────────┘
                                     │
                          ┌──────────────────────┐
                          │  MyEyes\Table        │
                          │  MyEyes\Filters      │
                          │  query building      │
                          └──────────────────────┘
```

Two rules keep this from becoming four drifting copies:

1. **A renderer never contains styling decisions.** It emits `me-*` classes.
   If a renderer needs a new visual, the class is added to core first.
2. **A renderer never contains behaviour that another renderer would need.**
   If it is not framework-specific, it belongs in `headless/`.

## Decisions

These were taken deliberately. Reversing one is its own decision, recorded in
`decisions/`, not a side effect of a feature.

- **D1 — Semantic CSS is the single source of truth.** Components reference
  `.me-btn`, `.me-input`; utilities are never inlined per framework. This is
  what lets one design system serve four renderers.
- **D2 — Tailwind v4 only.** CSS-first `@theme`, no `tailwind.config.js`.
- **D3 — Headless behaviour in plain TypeScript.** Alpine was rejected so the
  logic stays reusable by Vue and React.
- **D4 — Monorepo, separate distribution.** `@my-eyes/core`, `@my-eyes/vue`
  and `@my-eyes/react` on npm; `marcioelias/my-eyes` on Packagist.
- **D5 — The Laravel package is views only.** No routes, controllers or auth
  backend. Starter kit pages target conventional Laravel route names so they
  publish cleanly over Breeze or Fortify.
- **D6 — Colours are roles, not hues.** Components reference `primary-600`,
  never `blue-600`.
- **D7 — Component styles live in `@layer components`.** Utilities always win,
  so `class="me-btn bg-emerald-600"` comes out emerald without `!important`.

## Table state, per renderer

The table is the one component whose state has to live somewhere different in
each renderer. The query building never moves: `MyEyes\Table\Table` builds the
Eloquent query in all four cases. Only the source of the state changes.

| Renderer | State lives in | Navigation |
|---|---|---|
| Blade | query string | full page load, GET links and forms |
| Livewire | component properties, URL-synced | `wire:` round trip, morph |
| Vue / React | client store | `fetch` against an app-owned endpoint |

Blade's query-string state is not a limitation to be fixed — it is what makes
the table linkable, back-button friendly and useful before any JavaScript
loads. Livewire keeps that by URL-syncing its properties. Vue and React keep it
by writing the same keys to `history`.

## Data transport for Vue and React

Decided in `decisions/0001-json-payload-for-spa-tables.md`: `Table` gains a
`toPayload()` that serialises exactly what the client needs, and the
**application** exposes the endpoint. D5 holds — the package still ships no
routes.

```php
// routes/web.php — written by the application, not the package
Route::get('/users/table', fn () => MyEyes\Table\Table::make(User::query(), $columns)->toJson());
```

## Client-side responsiveness in Vue and React

The table **still paginates on the server** there. Two things are layered on
top, and neither replaces server pagination:

- **Page cache** — a page already fetched is served from memory when the user
  navigates back to it, so paging back and forth is instant.
- **Row virtualisation** — only visible rows are in the DOM, so a large page
  size stays smooth.

The cache is keyed by the full query state and dropped whenever sort, search,
filters or page size change, since those invalidate every page.

## Testing boundaries

| Layer | Tested by |
|---|---|
| Query building, payload shape | Pest, against SQLite |
| Blade / Livewire markup | Pest render tests |
| Headless TypeScript | `tsc` + unit tests |
| Stylesheet integrity | compiled through the Tailwind CLI in CI |
| Vue / React components | component tests against the payload fixtures |

The payload fixtures are shared: the Pest suite asserts the PHP produces them,
and the Vue and React suites consume the same files. That is what stops the
contract from drifting.
