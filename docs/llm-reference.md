# my-eyes — reference for language models

A complete, self-contained description of the public surface of `my-eyes`.
Everything here exists in the source. Anything not listed here **does not
exist** — see "What does not exist" at the end before inventing an API.

Packages: `marcioelias/my-eyes` (Composer) · `@my-eyes/core` and
`@my-eyes/vue` (npm).

Requirements: PHP 8.2+ (8.3+ on Laravel 13) · Laravel 12 or 13 · Tailwind CSS 4
· Livewire 3 or 4 (optional) · Vue 3.5+ (optional).

---

## 1. Core rules

1. **Styling lives in CSS, never in a component.** Components emit `me-*`
   classes. Do not add utility classes to change a component's identity; add
   them to adjust one instance (`class="me-btn me-btn--primary mt-4"`).
2. **Component styles sit in `@layer components`.** Tailwind utilities always
   win, so `class="me-btn me-btn--primary bg-emerald-600"` renders emerald. No
   `!important` is ever needed.
3. **Colours are roles, not hues** — `primary`, `secondary`, `success`,
   `danger`, `warning`, `info`. There is no `blue` or `red` variant.
4. **The package ships views and behaviour only.** No routes, no controllers,
   no migrations, no auth backend. Never tell a user to register a package
   route; there are none.
5. **Tailwind v4, CSS-first.** There is no `tailwind.config.js`.

---

## 2. Install

```bash
composer require marcioelias/my-eyes
npm install @my-eyes/core            # plus @my-eyes/vue for Vue
```

```css
/* resources/css/app.css */
@import 'tailwindcss';
@import '@my-eyes/core/css';
```

```js
/* resources/js/app.js */
import { startMyEyes } from '@my-eyes/core'

startMyEyes()
```

`startMyEyes()` also re-runs on `livewire:navigated`, `turbo:load`,
`inertia:navigate` and after a Livewire morph — so a page swapped in by any of
them arrives with its behaviour bound. Bindings are idempotent: calling
`initMyEyes(root)` again only picks up what is new. An application should not
need to re-bind by hand.

Publish tags: `my-eyes-config`, `my-eyes-components`, `my-eyes-pages`,
`my-eyes-errors`, `my-eyes-lang`.

---

## 3. Blade components

Namespace `x-me::`. Every component also accepts arbitrary HTML attributes,
which are merged onto its root element.

| Component | Props (default) |
|---|---|
| `x-me::alert` | `variant`(info) `title` `icon` `dismissible`(false) |
| `x-me::avatar` | `name` `src` `size` `status` |
| `x-me::badge` | `variant` `icon` `dot`(false) |
| `x-me::brand` | `href` `name` `showName`(true) |
| `x-me::button` | `variant` `size` `type`(button) `href` `icon` `block`(false) `loading`(false) `disabled`(false) |
| `x-me::card` | `title` `description` `actions` `footer` `flush`(false) |
| `x-me::checkbox` | `name` `id` `value`(1) `label` `hint` `error` `checked`(false) `card`(false) |
| `x-me::dropdown` | `align`(end) `sheet`(true) `trigger` |
| `x-me::dropdown.item` | `href` `icon` `variant` `keepOpen`(false) |
| `x-me::dropdown.header` | `title` `meta` |
| `x-me::dropdown.divider` | — |
| `x-me::field` | `label` `hint` `error` `for` `required`(false) `inline`(false) |
| `x-me::filters` | `table` |
| `x-me::icon` | `name` (required) `stroke`(1.75) |
| `x-me::input` | `name` `id` `type`(text) `value` `label` `hint` `error` `size` `required`(false) `prefix` `suffix` |
| `x-me::modal` | `id` (required) `variant`(primary) `icon` `title` `confirm` `cancel` `action` `method`(POST) `align`(center) `size` `static`(false) |
| `x-me::numeric` | `name` `id` `value` `label` `hint` `error` `decimals` `min` `max` `step`(1) `prefix` `suffix` `grouping`(true) `locale` `stepper`(true) `required`(false) |
| `x-me::pagination` | `paginator` (required) `window`(1) |
| `x-me::progress` | `value` `max`(100) `variant` `size` `label` `showValue`(false) |
| `x-me::progress-ring` | `value` `max`(100) `variant` `size` `label` `showValue`(true) |
| `x-me::radio` | `name` `id` `value` `label` `hint` `checked`(false) `card`(false) |
| `x-me::select` | `name` `id` `options`([]) `selected` `placeholder` `label` `hint` `error` `size` `required`(false) `multiple`(false) |
| `x-me::select-field` | `name` `id` `options`([]) `selected` `label` `hint` `error` `placeholder` `multiple`(false) `searchable`(true) `clearable`(true) `required`(false) |
| `x-me::switch` | `name` `id` `value`(1) `label` `hint` `error` `checked`(false) `size` |
| `x-me::table` | `table` (required) `striped`(false) `compact`(false) `search`(true) `filters`(true) `perPage`(true) `empty` `actions` |
| `x-me::textarea` | `name` `id` `value` `label` `hint` `error` `rows`(4) `required`(false) |
| `x-me::theme-toggle` | `size`(md) |
| `x-me::theme-menu` | `align`(end) |
| `x-me::toasts` | `position`(top-end) `duration`(5000) |
| `x-me::tooltip` | `text` (required) `placement`(top) |
| `x-me::translations` | — |
| `x-me::upload` | `name` `id` `label` `hint` `error` `accept` `multiple`(false) `maxSize` `maxFiles` `required`(false) `disabled`(false) |
| `x-me::user-menu` | `name` `email` `avatar` `showName`(true) |
| `x-me::nav.section` | `title` |
| `x-me::nav.group` | `label` `icon` `open`(false) |
| `x-me::nav.item` | `href` `icon` `active` `badge` |
| `x-me::nav.subitem` | `href` `active` |
| `x-me::layouts.admin` | `title` `heading` `subheading` `nav` `topbar` `actions` `user` `footer` `sidebarFooter` |
| `x-me::layouts.auth` | `title` `heading` `subheading` `footer` |
| `x-me::layouts.error` | `status` `title` `icon` `severity` `home`(true) `back`(true) |
| `x-me::layouts.head` | `title` |
| `x-me::livewire.filters` | `table` |
| `x-me::livewire.pagination` | `paginator` `pageName`(page) `window`(1) |

### Values

- `variant` (button): `primary` `secondary` `success` `danger` `warning` `info`
  `ghost` `link` `outline-primary` `outline-secondary` `outline-success`
  `outline-danger` `outline-warning` `outline-info`
- `variant` (alert, badge, modal, progress): `primary` `success` `danger`
  `warning` `info`
- `size` (button): `xs` `sm` `md` `lg` · `size` (input): `sm` `md` `lg`
- `align` (column): `start` `center` `end`

### Icon names

128 icons, one family: 24×24 grid, 1.75 stroke, round terminals.

`activity` `alert-circle` `alert-triangle` `archive` `arrow-down`
`arrow-left` `arrow-right` `arrow-up` `at-sign` `banknote` `bar-chart`
`barcode` `bell` `bell-off` `bookmark` `briefcase` `building`
`calculator` `calendar` `calendar-check` `check` `check-circle`
`chevron-down` `chevron-left` `chevron-right` `chevron-up` `circle-x`
`clipboard` `clock` `clock-history` `cloud` `collapse` `columns`
`contact` `copy` `credit-card` `database` `download` `expand`
`external-link` `eye` `eye-off` `file` `file-check` `file-plus`
`file-question` `file-text` `file-x` `filter` `flag` `folder-open`
`folder-plus` `gauge` `grid` `headset` `help-circle` `home` `hourglass`
`id-card` `info` `invoice` `key` `layout-dashboard` `line-chart` `link`
`list` `lock` `log-in` `log-out` `mail` `maximize` `menu`
`message-square` `minimize` `minus` `monitor` `moon` `more-horizontal`
`more-vertical` `package` `panel-left` `paperclip` `pencil` `percent`
`phone` `pie-chart` `plus` `power` `printer` `receipt` `redo` `refresh`
`save` `search` `send` `server` `server-crash` `settings` `share`
`shield` `shield-off` `shopping-cart` `sort-asc` `sort-desc` `star` `sun`
`table` `tag` `target` `terminal` `thumbs-down` `thumbs-up` `trash`
`trending-down` `trending-up` `truck` `undo` `unlock` `upload`
`upload-cloud` `user` `user-check` `user-group` `user-plus` `user-x`
`users` `wallet` `x`

Add or override one through the `icons` key in `config/my-eyes.php` (Blade) or
`registerIcons()` (JavaScript). For a one-off drawing, pass the geometry as the
default slot and it inherits the standard wrapper:

```blade
<x-me::icon><path d="M4 20h16" /></x-me::icon>
```

```vue
<MeIcon><path d="M4 20h16" /></MeIcon>
```

Never hand-copy the `<svg>` wrapper into an application — that copy stops
matching the day the design system changes it.

An unknown name throws while `app.debug` is on (Blade) and warns once to the
console (Vue). It never renders a silently empty icon.

---

## 4. The data table (PHP)

### `MyEyes\Table\Table`

```php
Table::make(EloquentBuilder|QueryBuilder|Relation $query, array $columns = []): self
```

Chainable configuration:

| Method | Purpose |
|---|---|
| `defaultSort(string $key, string $direction = 'asc')` | Order when the request asks for none |
| `perPage(int $perPage)` | Default page size (25) |
| `perPageOptions(array $options)` | Offered page sizes ([10, 25, 50, 100]) |
| `name(string $name)` | Prefixes every query string key, for two tables on a page |
| `forRequest(Request $request)` | Overrides the request; used by tests and by Livewire |

Reading:

`columns()` `filterableColumns()` `isSearchable()` `parameter(string $key)`
`request()` `sortKey()` `sortDirection()` `search()` `filters()`
`perPageChoices()` `currentPerPage()` `paginator()` `rows()` `isEmpty()`
`sortUrl(Column $column)` `perPageUrl(int $perPage)` `resetUrl()`
`filterSchema()` `toPayload()` `toJson(int $options = 0)`
`Table::parameterFor(?string $name, string $key)`

`paginator()` is memoised, so `rows()` and `paginator()` cost one query.
`Table` implements `Illuminate\Contracts\Support\Jsonable`, so a route may
return the table itself.

### `MyEyes\Table\Column`

```php
Column::make(string $key, ?string $label = null): self
```

The label defaults to the key's last segment, headline-cased.

| Method | Purpose |
|---|---|
| `sortable(bool = true)` | Allows sorting on this column |
| `searchable(bool = true)` | Includes it in the quick search |
| `filterable(FilterType $type = FilterType::Text, array $options = [])` | Allows it in the filter builder; `$options` is required for `Select` |
| `type(FilterType $type)` | Sets the filter type without making it filterable |
| `align(string $align)` | `start` `center` `end` |
| `numeric()` | Number type and end alignment |
| `field(string $field)` | The database column, when it differs from the key |
| `format(Closure $format)` | `fn (mixed $value, mixed $row)` — return a string, an `Htmlable`, or any JSON-safe value |
| `view(string $view)` | Renders the cell through a Blade view receiving `row`, `value`, `column` |
| `html(bool = true)` | Marks the column's values as markup **in the payload** |
| `sortUsing(Closure)` | `fn ($query, string $direction)` — relations, joins, expressions |
| `filterUsing(Closure)` | `fn ($query, Condition $condition)` |
| `searchUsing(Closure)` | `fn ($query, string $term)` |

Read-only: `key()` `target()` `label()` `isSortable()` `isFilterable()`
`isSearchable()` `isHtml()` `filterType()` `options()` `alignment()`
`render($row)` `toValue($row)` `toPayload()` `toFilterSchema()`

### `MyEyes\Filters\FilterType` and `Operator`

`FilterType`: `Text` `Number` `Date` `Boolean` `Select`.

`Operator` backing values, and which type offers them:

| Type | Operators |
|---|---|
| `Text` | `contains` `not_contains` `eq` `neq` `starts` `ends` `empty` `not_empty` |
| `Number`, `Date` | `eq` `neq` `gt` `gte` `lt` `lte` `between` `empty` `not_empty` |
| `Select` | `eq` `neq` `in` `empty` `not_empty` |
| `Boolean` | `eq` |

**The operator for "equals" is `eq`, not `equals`.**

Security: a condition naming a column that is not filterable, or an operator
its type does not offer, is dropped. A crafted URL cannot filter or sort on a
column the table never exposed.

Date filtering expands to whole days: `eq` on `2026-01-31` matches the entire
day, `lte` includes it, `gt` starts after it.

### Query string keys

```
?sort=name&direction=asc&per_page=25&q=ana&page=2
&filters[0][field]=status&filters[0][operator]=eq&filters[0][values][0]=active
&conjunction=and
```

A named table prefixes every key: `users_sort`, `users_page`, `users_filters[0][field]`.

There is **one** conjunction for the whole set (`and` or `or`), not one per row.

---

## 5. Livewire

```php
use MyEyes\Livewire\TableComponent;

class UsersTable extends TableComponent
{
    protected function query(): Builder { return User::query(); }

    protected function columns(): array
    {
        return [Column::make('name')->sortable()->searchable()];
    }

    // Optional — prefixes the query string keys.
    protected function tableName(): ?string { return 'users'; }
}
```

```blade
<livewire:users-table />
```

Public properties: `sort` `direction` `search` `perPage` (nullable) `filters`
`conjunction` `striped` `compact`, plus Livewire's `paginators`.

Actions: `sortBy(string $key)` · `applyFilters(array $filters = [], string $conjunction = 'and')`
· `resetTable()` · `table(): Table` · plus `gotoPage` / `nextPage` /
`previousPage` from `WithPagination`.

For a component that already exists, use the trait instead:

```php
use MyEyes\Livewire\InteractsWithTable;

$table = $this->buildTable(User::query(), $columns);
```

Notes:

- Everything reaching the query is re-validated server-side. A property is a
  request parameter by another name.
- The filter panel is `wire:ignore`'d, because its rows are rendered by the
  core JavaScript. Its **Clear** applies immediately; there is no toolbar
  clear-all in the Livewire table.
- Sorting, searching, filtering and page-size changes reset to page 1.

---

## 6. The table payload (Vue, React, any client)

The application owns the route. The package ships none.

```php
Route::get('/users/table', function () {
    Gate::authorize('viewAny', User::class);

    return Table::make(User::query(), $columns)->defaultSort('created_at', 'desc');
})->middleware('auth');
```

Response shape:

```jsonc
{
  "columns": [{ "key": "name", "label": "Name", "align": "start",
                "sortable": true, "searchable": true, "filterable": false, "html": false }],
  "rows": [{ "name": "Ana Souza" }],
  "sort": { "key": "created_at", "direction": "desc" },   // key may be null
  "search": "ana",
  "filters": { "conditions": [{ "field": "status", "operator": "eq", "values": ["active"] }],
               "conjunction": "and" },
  "schema": [ /* filterable columns, for the filter builder */ ],
  "pagination": { "page": 2, "perPage": 25, "total": 431, "lastPage": 18,
                  "from": 26, "to": 50 },              // from/to null on an empty page
  "perPageOptions": [10, 25, 50, 100]
}
```

Rules:

- The payload reports the state that was **applied**, not the state requested.
  Clients must render their controls from the response.
- `rows` carry only declared columns. A model attribute that is not a column
  never reaches the client.
- Values are JSON-safe: dates become ISO 8601 strings, backed enums their
  value, `Arrayable`/`JsonSerializable` their array form. Anything else throws
  `MyEyes\Table\UnserialisableColumn`.
- A column rendering markup (`view()`, or a `format()` returning `Htmlable`)
  throws unless it also declares `->html()`. Clients render unmarked values as
  **text**.

---

## 7. `@my-eyes/core` (JavaScript)

Entry points: `startMyEyes()` · `initMyEyes(root?)` · `initFilters(root?)` ·
`initFilterPanels(root?)`.

Toasts: `toast(options): Toast` — **one options object, not a message string**:

```ts
toast({ text: 'Saved', title?, variant?, position?, duration?, dismissible? })
```

`variant`: `primary` `success` `danger` `warning` `info` `neutral` (default).
`position`: `top-start` `top-center` `top-end` `bottom-start` `bottom-center`
`bottom-end`. `duration` in milliseconds; `0` or less keeps the toast until
dismissed and forces the close button on.

Messages: `configureMessages(record)` · `resetMessages()` · `t(key, replacements?)`
· `loadMessagesFromDocument(root?)`. Placeholders use Laravel's `:name` style.
On the PHP side, `MyEyes\Support\Messages::forJavaScript()` returns exactly the
keys the dictionary accepts — hand it to Inertia or a `<script>` tag.

Message keys (49):

`toast.close` `password.show` `password.hide` `upload.remove`
`upload.tooLarge` `upload.wrongType` `upload.tooMany` `upload.drop`
`upload.browse` `upload.upTo` `filters.where` `filters.and` `filters.or`
`filters.remove` `filters.value` `filters.rangeSeparator`
`filters.commaHint` `common.yes` `common.no` `select.search`
`select.empty` `select.placeholder` `select.selected` `select.clear`
`filters.title` `filters.add` `filters.apply` `filters.clear`
`filters.empty` `table.search` `table.perPage` `table.showing`
`table.empty` `table.emptyFiltered` `table.previous` `table.next`
`table.retry` `pagination.label` `layout.skip` `layout.openMenu`
`layout.closeMenu` `layout.mainNav` `layout.collapse`
`layout.toggleTheme` `layout.accountMenu` `layout.theme` `layout.system`
`layout.light` `layout.dark`

Table client (framework-free):

```ts
const client = createTableClient({ endpoint, name?, syncUrl?, fetcher? })
client.start() | goToPage(n) | setSearch(s) | setPerPage(n) | toggleSort(key)
     | setFilters(conditions, conjunction) | refresh() | retry() | destroy()
client.getState()   // { status: 'idle'|'loading'|'ready'|'error', payload, error }
client.subscribe(listener)
```

Also exported: `buildQueryString` `readQueryFromUrl` `computeVirtualWindow`
`shouldVirtualise`, the filter model (`blankCondition` `retargetCondition`
`fitValues` `findField` `findOperator`), the icon set (`icons`, `IconName`),
and the theme, select, numeric, upload and dismissable headless models.

The individual DOM bindings are exported too, for a component framework that
knows exactly which element it mounted: `initDropdowns` `initModals`
`initTooltips` `initToasts` `initSelects` `initUploads` `initNumericInputs`
`initShell` `initThemeToggles` `initPasswordToggles` `initDismissables`
`initNavigateSelects` `initFilters` `initFilterPanels`. Each takes a root and
skips elements it has already bound.

Theme: three modes — `system` (default), `light`, `dark`. Any element with
`data-me-theme` cycles them; `data-me-theme="dark"` sets one. Stored under
`localStorage['my-eyes:theme']`.

---

## 8. `@my-eyes/vue`

Every Blade component has a Vue equivalent — a Pest test counts the two sets,
so this claim cannot drift. Two Blade components have no Vue counterpart on
purpose: `x-me::layouts.head` emits `<html>`/`<head>` for a server-rendered
page, and `x-me::translations` emits the locale's strings as a script tag, which
Vue replaces with `configureMessages()`.

Exports:

| Group | Exports |
|---|---|
| Table | `MeTable` `MeFilters` `MePagination` `useTable` |
| Display | `MeButton` `MeBadge` `MeAlert` `MeCard` `MeAvatar` `MeIcon` `MeProgress` `MeProgressRing` `MeBrand` |
| Form | `MeField` `MeInput` `MeTextarea` `MeSelect` `MeSelectField` `MeCheckbox` `MeRadio` `MeSwitch` `MeNumeric` `MeUpload` |
| Overlay | `MeModal` `MeDropdown` `MeDropdownItem` `MeDropdownHeader` `MeDropdownDivider` `MeTooltip` `MeToasts` `useToasts` |
| Shell | `MeAdminLayout` `MeAuthLayout` `MeErrorLayout` `MeNavSection` `MeNavGroup` `MeNavItem` `MeNavSubitem` `MeUserMenu` `MeThemeToggle` `MeThemeMenu` |
| Helper | `initials(name)` |

Props mirror the Blade component of the same name (section 3), with these
exceptions:

- Every form control uses `v-model` — `modelValue` plus `update:modelValue` —
  in place of `value`/`checked`. `MeCheckbox` binds a boolean, or an array to
  act as one of a group.
- `MeButton` takes `iconOnly` for the icon-only shape; `icon` is the icon name.
- `MeAdminLayout`, `MeAuthLayout` and `MeErrorLayout` render **body content,
  not a document**: no `<html>`, no `<head>`. `MeAdminLayout` slots: `nav`,
  `topbar`, `user`, `actions`, `sidebarFooter`, `brand`, `footer`, default.
  `MeAuthLayout`: `brand`, `status`, `footer`, default. `MeErrorLayout` takes
  `status`, `title`, `icon`, `severity`, `home`, `homeHref`, `back`.
- `MeNavItem` requires `active` explicitly; it does not compare URLs.
- `MeModal` emits `confirm` and has no `action`/`method`. There is no form, no
  CSRF token and no method spoofing.
- `MeUpload` emits `update:modelValue` with a `File[]`.
- `MeAlert` takes `dismissLabel`, plus `v-model:visible` and a `dismiss` emit.
- `MeDropdown` emits `update:open` (read-only — the trigger is inside it).

### Client-side routing

Every component that renders a link takes `as`, defaulting to `'a'`:
`MeNavItem`, `MeNavSubitem`, `MeDropdownItem`, `MeBrand`, and `MeButton` when
given an `href`.

```vue
<MeNavItem :as="Link" href="/domains">Domains</MeNavItem>
```

Pass Inertia's `Link` or vue-router's `RouterLink`. The package never detects
the router itself — do not suggest that it does, and do not write a click
interceptor to work around a plain anchor.

`MePagination` renders **buttons by default** — its items fetch a page rather
than navigating, and a link that does not navigate misleads assistive
technology. Pass `hrefFor: (page) => string` to make them real links; a plain
click still fetches, a modified click is left to the browser, and a disabled
edge stays a button rather than becoming a dead link.

### Opening a modal

Two ways, both supported:

```vue
<MeModal v-model:open="confirming" id="delete-user" @confirm="destroy" />
```

```html
<button data-me-modal-open="delete-user">Delete</button>
```

`MeModal` emits `close` and `update:open` however it was dismissed — Escape,
backdrop, or a cancel button.

### `useTheme()`

```ts
const { scheme, resolved, setScheme } = useTheme()
```

`scheme` is the choice, including `'system'`. `resolved` is `'light'` or
`'dark'`, with `'system'` answered against the OS and updated when it changes.

```vue
<MeTable endpoint="/users/table">
  <template #cell:status="{ value, row, column, index }">
    <MeBadge :variant="value === 'active' ? 'success' : 'danger'">{{ value }}</MeBadge>
  </template>
</MeTable>
```

`MeTable` props: `endpoint` (required) · `name`(null) · `syncUrl`(true) ·
`striped`(false) · `compact`(false) · `rowHeight`(44) · `overscan`(8) ·
`searchDebounce`(400) · `fetcher`(`fetch`).

Slots: `cell:<key>` (scope `{ value, row, column, index }`) · `empty` ·
`actions`.

`useTable({ endpoint, name?, syncUrl?, fetcher? })` returns `state` `rows`
`columns` `pagination` `schema` `sort` `search` `filters` `perPageOptions`
`loading` `error` `client` `goToPage` `setSearch` `setPerPage` `toggleSort`
`setFilters` `refresh` `retry`.

Behaviour that is guaranteed:

- Server pagination. Client caching and row windowing sit on top of it.
- A page already fetched returns from memory with no `loading` state.
- Changing sort, search, filters or page size drops the whole cache.
- Rows are windowed above 30 rows; shorter pages render plainly.
- A superseded request is aborted and its response discarded.
- A failure keeps the previous rows and offers a retry.
- Unmarked values render as text; only `html` columns render as markup.

Source is TypeScript throughout; the published package is compiled JavaScript
with `.d.ts` declarations. Components are `defineComponent` + render functions,
not `.vue` files — this is an authoring choice and does not affect consumers.

---

## 9. Configuration

`config/my-eyes.php`: `brand.name` `brand.logo` `defaults.size`
`defaults.button_variant` `locale` `layout.footer` `layout.sidebar_collapsible`
`vite` (array of entrypoints).

---

## 10. What does not exist

Do not generate any of the following — they are not part of this package:

- **Routes, controllers, middleware, migrations, models, auth backend.** The
  starter kit screens are published Blade views that target conventional
  Laravel route names (`login`, `register`, `password.request`, `dashboard`,
  `profile.edit`); they need Breeze, Fortify or your own controllers.
- **A package-provided table endpoint.** There is no `/my-eyes/table` route.
- **`tailwind.config.js`.** Tailwind v4, CSS-first `@theme` only.
- **A `MyEyes` facade**, service container bindings, or `MyEyes::` static
  helpers of any kind.
- **React, Svelte or Angular packages.** React is specified
  (`docs/features/react-package.md`) but not implemented.
- **Vue components beyond the list in section 8.** The list is complete; there
  is no `MeTabs`, `MeAccordion`, `MeDatePicker`, `MeCombobox`, `MeDrawer`,
  `MePopover`, `MeStepper`, `MeBreadcrumb`, `MeSkeleton` or `MeSpinner`.
- **Vue starter-kit screens.** Login, registration and password reset ship as
  Blade views only. The components to build them from all exist.
- **`.vue` single-file components** in the published package.
- **Row selection, bulk actions, inline editing, column resizing, column
  reordering, CSV/Excel export, infinite scroll, grouped rows, nested filter
  groups with parentheses.** None of these are implemented in any renderer.
- **Client-side sorting or filtering.** Every renderer sorts and filters on the
  server.
- **A `variant` named after a colour** (`blue`, `red`, `green`). Roles only.
- **`Column::relation()`, `Column::badge()`, `Column::date()`,
  `Column::boolean()`.** Use `format()`, `view()`, or the `*Using` closures.
- **`operator: "equals"`.** It is `eq`.
- **Alpine.js.** It was explicitly rejected; behaviour is plain TypeScript.

When unsure whether something exists, say so and point at `docs/` rather than
inventing a plausible API.
