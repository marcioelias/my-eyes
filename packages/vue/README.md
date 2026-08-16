# @my-eyes/vue

my-eyes components for Vue 3 — the same design system, the same behaviour and
the same server-driven table that the Blade and Livewire renderers use.

The look lives in `@my-eyes/core`'s stylesheet and the behaviour in its
framework-free TypeScript. These components only emit the markup that
stylesheet expects, which is why a Vue button and a Blade button cannot drift
apart.

## Install

```bash
npm install @my-eyes/vue @my-eyes/core
```

`resources/css/app.css`:

```css
@import 'tailwindcss';
@import '@my-eyes/core/css';
```

Both `vue` and `@my-eyes/core` are peer dependencies; the package ships no
runtime dependency of its own.

## Table

The table paginates **on the server**. The Laravel side serialises itself and
your application serves it — the PHP package ships no routes:

```php
// routes/web.php
Route::get('/users/table', function () {
    Gate::authorize('viewAny', User::class);

    return MyEyes\Table\Table::make(User::query(), [
        MyEyes\Table\Column::make('name', __('Name'))->sortable()->searchable(),
        MyEyes\Table\Column::make('status', __('Status'))
            ->filterable(MyEyes\Filters\FilterType::Select, ['active' => __('Active')]),
    ])->defaultSort('created_at', 'desc');
})->middleware('auth');
```

```vue
<script setup lang="ts">
import { MeTable, MeBadge } from '@my-eyes/vue'
</script>

<template>
  <MeTable endpoint="/users/table">
    <template #cell:status="{ value }">
      <MeBadge :variant="value === 'active' ? 'success' : 'danger'">{{ value }}</MeBadge>
    </template>
  </MeTable>
</template>
```

What you get on top of server pagination:

- **Pages already fetched come back from memory.** Paging back and forth is
  instant. The cache is dropped whenever sort, search, filters or page size
  change, because those invalidate every page.
- **Rows outside the viewport are not in the DOM**, so a large page size stays
  smooth. Short pages render plainly — windowing a handful of rows costs more
  than it saves.
- **The URL tracks the table**, using the same query string keys the Blade
  table uses. A link opens the same view of the same data in either renderer.
- **Superseded requests are dropped.** Paging quickly from 1 to 5 shows page 5,
  whatever order the responses land in.
- **A failure keeps the rows on screen** and offers a retry, rather than
  blanking the table the reader was using.

### Props

| Prop | Default | Meaning |
|---|---|---|
| `endpoint` | required | URL serving the payload |
| `name` | `null` | Query string prefix, matching `Table::name()` |
| `syncUrl` | `true` | Mirror the applied state into the address bar |
| `striped`, `compact` | `false` | Visual variants, same classes as Blade |
| `rowHeight` | `44` | Row height assumed by the windowing |
| `overscan` | `8` | Rows rendered beyond the viewport |
| `searchDebounce` | `400` | Milliseconds before a search reaches the server |
| `fetcher` | `fetch` | Replace the request — auth headers, CSRF, credentials |

### Slots

| Slot | Scope | Purpose |
|---|---|---|
| `cell:<key>` | `{ value, row, column, index }` | Replace one column's cell |
| `empty` | — | Replace the empty state |
| `actions` | — | Toolbar content, beside the filters |

### Cell values

Values arrive as data, not markup, and render as **text** — a value containing
`<script>` shows as characters. A column that genuinely needs markup opts in on
the server with `Column::html()`, and only then is it rendered as HTML. Use a
`cell:<key>` slot for anything richer; that is the supported route.

### Without the component

`useTable` is the same state machine with no markup attached:

```ts
const { rows, columns, pagination, loading, error, sort, setSearch, goToPage } =
    useTable({ endpoint: '/users/table' })
```

## Translations

Strings the components render themselves come from the core message
dictionary. Set them once at boot:

```ts
import { configureMessages } from '@my-eyes/core'

configureMessages({ 'table.search': 'Buscar', 'table.empty': 'Nenhum registro' })
```

## Components

| | |
|---|---|
| **Table** | `MeTable` `MeFilters` `MePagination` `useTable` |
| **Display** | `MeButton` `MeBadge` `MeAlert` `MeCard` `MeAvatar` `MeIcon` `MeProgress` `MeProgressRing` `MeBrand` |
| **Form** | `MeField` `MeInput` `MeTextarea` `MeSelect` `MeSelectField` `MeCheckbox` `MeRadio` `MeSwitch` `MeNumeric` `MeUpload` |
| **Overlay** | `MeModal` `MeDropdown` `MeDropdownItem` `MeDropdownHeader` `MeDropdownDivider` `MeTooltip` `MeToasts` `useToasts` |
| **Shell** | `MeAdminLayout` `MeAuthLayout` `MeErrorLayout` `MeNavSection` `MeNavGroup` `MeNavItem` `MeNavSubitem` `MeUserMenu` `MeThemeToggle` `MeThemeMenu` |

Every form control supports `v-model`. The ones that carry real behaviour —
the custom select, the numeric input, the upload dropzone, dropdowns, modals,
tooltips and the shell — delegate to `@my-eyes/core`, the same code the Blade
and Livewire renderers run, so a dropdown behaves identically everywhere.

## With Inertia or vue-router

Every component that renders a link takes `as`, defaulting to `'a'`:

```vue
<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <MeNavItem :as="Link" href="/domains" :active="true">Domains</MeNavItem>
</template>
```

`MeNavItem`, `MeNavSubitem`, `MeDropdownItem`, `MeBrand` and `MeButton` (with an
`href`) all accept it. Nothing changes for an application without a router.

The package never detects the router in use — that would tie it to one and
break everyone on another.

`startMyEyes()` re-binds on `inertia:navigate`, so a page Inertia swaps in
arrives with its dropdowns, tooltips and modals wired. You should not need to
call `initMyEyes()` yourself.

Every Blade component has an equivalent here, and a test in the Composer
package counts the two sets so that stays true. The two exceptions are
deliberate: `x-me::layouts.head` emits the document head, and
`x-me::translations` emits a script tag — a Vue application owns the first and
calls `configureMessages()` for the second.

Four things differ from Blade on purpose:

- `MeAdminLayout` renders body content, not a document — your application owns
  `<html>` and `<head>`
- `MeNavItem` takes `active` explicitly instead of comparing URLs
- `MeModal` emits `confirm` instead of submitting a form
- `MeAdminLayout`, `MeAuthLayout` and `MeErrorLayout` render body content, not
  a document

```vue
<MeAdminLayout heading="Users">
  <template #nav>
    <MeNavSection title="Manage">
      <MeNavItem href="/users" icon="users" :active="true">Users</MeNavItem>
    </MeNavSection>
  </template>

  <template #user>
    <MeUserMenu name="Márcio Elias" email="marcio@example.com">
      <MeDropdownItem href="/profile" icon="user">Profile</MeDropdownItem>
    </MeUserMenu>
  </template>

  <MeCard title="Recent">
    <MeTable endpoint="/users/table" />
  </MeCard>
</MeAdminLayout>
```

Toasts, from anywhere:

```ts
const toasts = useToasts()
toasts.success('Saved')
```

Place `<MeToasts />` once in the layout for them to appear in.

## Pagination as links

`MePagination` renders buttons: its items fetch a page rather than navigating.
When the pages do have addresses — the table already mirrors its state into the
URL — pass `hrefFor` and they become real links, so middle-click and "open in
new tab" work:

```vue
<MeTable endpoint="/users/table" />
<!-- or, driving pagination yourself -->
<MePagination :pagination="pagination" :href-for="(page) => `/users?page=${page}`" @navigate="go" />
```

A plain click still fetches without reloading; a modified click is left to the
browser.

## Not included

The starter-kit screens — login, registration, password reset — ship as Blade
views only. Every component needed to build them is here.

## Licence

MIT © Márcio Elias
