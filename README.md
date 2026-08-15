<div align="center">

# my-eyes

**A Tailwind component library and admin scaffolding for Laravel.**

Think of it as a better Bootstrap: a small set of well-behaved components,
semantic theme colours you swap in one place, light and dark out of the box,
and an admin shell that is genuinely usable on a phone.

[**Live showcase →**](https://marcioelias.github.io/my-eyes/)

[![CI](https://github.com/marcioelias/my-eyes/actions/workflows/ci.yml/badge.svg)](https://github.com/marcioelias/my-eyes/actions/workflows/ci.yml)
[![Packagist](https://img.shields.io/packagist/v/marcioelias/my-eyes.svg)](https://packagist.org/packages/marcioelias/my-eyes)
[![npm](https://img.shields.io/npm/v/@my-eyes/core.svg)](https://www.npmjs.com/package/@my-eyes/core)
[![PHP](https://img.shields.io/packagist/dependency-v/marcioelias/my-eyes/php.svg)](composer.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## Why

Most component libraries make you choose between a design system you cannot
change and a pile of utility classes you have to re-type on every project.
`my-eyes` takes a third route:

- **Colours are roles, not hues.** Components reference `primary-600`, never
  `blue-600`. Rebranding is remapping six roles in your own CSS.
- **One design system, many frameworks.** The look lives in CSS and the
  behaviour in framework-free TypeScript, so Blade, Livewire, Vue and React
  render the *same* markup instead of four drifting copies.
- **Utilities always win.** Component styles sit in `@layer components`, below
  Tailwind's utilities, so `class="me-btn me-btn--primary bg-emerald-600"` comes
  out emerald. No `!important`, no fighting the framework.
- **Server-first.** The table sorts, filters and paginates through the query
  string — linkable URLs, working back button, results before any JS loads.

## Contents

- [Install](#install)
- [Theming](#theming) · [Colour modes](#colour-modes)
- [Components](#components)
- [Data table](#data-table) · [Advanced filters](#advanced-filters)
- [Modal](#confirmation-modal) · [Toasts](#toasts) · [Tooltip](#tooltip) · [Progress](#progress)
- [Translations](#translations)
- [Admin layout](#admin-layout) · [Starter kit](#starter-kit-pages)
- [Publishing](#publishing) · [Development](#development)

## Requirements

| | |
|---|---|
| PHP | 8.2+ (8.3+ on Laravel 13) |
| Laravel | 12 or 13 |
| Tailwind CSS | 4 |
| Livewire | 3 or 4 (optional) |

## Install

```bash
composer require marcioelias/my-eyes
npm install @my-eyes/core
```

`resources/css/app.css`:

```css
@import 'tailwindcss';
@import '@my-eyes/core/css';
```

`resources/js/app.js`:

```js
import { startMyEyes } from '@my-eyes/core'

startMyEyes()
```

That is the whole setup. `startMyEyes()` wires every behaviour and re-runs
itself after Livewire or Turbo swap DOM, so the same components work unchanged
across all three.

No bundler? Use the standalone build instead — it starts itself and exposes
`window.myEyes`:

```html
<script src="/vendor/my-eyes/my-eyes.min.js"></script>
```

## Theming

Six roles, each a full 50–950 scale: `primary`, `secondary`, `success`,
`danger`, `warning`, `info`. Rebrand by remapping them:

```css
@import 'tailwindcss';
@import '@my-eyes/core/css';

@theme {
    --color-primary-50:  var(--color-violet-50);
    --color-primary-600: var(--color-violet-600);
    --color-primary-700: var(--color-violet-700);
    /* ...the rest of the scale */
}
```

Point them at a Tailwind palette or at your own `oklch()` values. Shape is
tunable too:

```css
:root {
    --me-radius: 0.5rem;
    --me-sidebar-width: 16rem;
    --me-topbar-height: 3.5rem;
}
```

### One definition per token

Light and dark values are declared **once**, side by side, with `light-dark()`:

```css
--me-surface: light-dark(var(--color-slate-50), var(--color-slate-950));
```

Switching themes flips `color-scheme`; there is no second palette to keep in
sync, so the two can never drift apart. Tinted surfaces (outline buttons,
alerts, the active nav item) are derived with `color-mix()` against the current
surface, which is why no component stylesheet contains a dark-mode block.

### Colour modes

Three modes — **system** (the default), light and dark. System follows the OS,
so a first-time visitor gets whatever their machine asks for.

```blade
<x-me::theme-toggle />   {{-- cycles system → light → dark → system --}}
<x-me::theme-menu />     {{-- explicit three-option picker --}}
```

The icon shows the mode that is *selected*, so "system" stays distinguishable
from an explicit choice that happens to match the OS right now. The bundled
layouts apply the stored mode before first paint, so the page never flashes.

## Components

**Forms** — `button`, `input`, `numeric`, `textarea`, `select`, `select-field`,
`checkbox`, `radio`, `switch`, `upload`, `field`

**UI** — `alert`, `badge`, `avatar`, `card`, `dropdown`, `modal`, `tooltip`,
`toasts`, `progress`, `progress-ring`, `icon`, `brand`, `theme-toggle`,
`theme-menu`, `user-menu`, `nav.*`

**Data** — `table`, `filters`, `pagination`

Every form component resolves its own validation error, old input and label:

```blade
<x-me::input name="email" type="email" :label="__('Email')" required />
```

`type="password"` gets a reveal button automatically.

### Numeric input

Renders two inputs: a visible one formatted for the user's locale and a hidden
one carrying the raw value — so the server never parses `1.234,56`.

```blade
<x-me::numeric name="price" :label="__('Price')" prefix="R$" :decimals="2" :min="0" />
```

### Two selects, on purpose

`<x-me::select>` wraps the **native** element and gets the platform picker on
mobile. Use it for a plain list of values.

`<x-me::select-field>` renders its **own** list, for multiple selection, search,
descriptions, groups or disabled options:

```blade
<x-me::select-field
    name="tags"
    :label="__('Tags')"
    multiple
    :selected="['php']"
    :options="[
        ['value' => 'php', 'label' => 'PHP', 'group' => 'Backend'],
        ['value' => 'go',  'label' => 'Go',  'disabled' => true],
        ['value' => 'vue', 'label' => 'Vue', 'description' => 'Composition API'],
    ]"
/>
```

A flat `['php' => 'PHP']` map works too. Values post through hidden inputs, so
the field submits like any other. On phones the list becomes a bottom sheet — a
dropdown pinned under its trigger is hard to reach and gets covered by the
keyboard.

## Data table

Sorting, search, advanced filters, page size and pagination, all driven by the
query string. The controller declares; the view renders.

```php
use MyEyes\Filters\FilterType;
use MyEyes\Table\Column;
use MyEyes\Table\Table;

$table = Table::make(Order::query()->with('customer'), [
    Column::make('reference', __('Reference'))->sortable()->searchable(),
    Column::make('customer.name', __('Customer'))->searchable(),

    Column::make('status', __('Status'))
        ->filterable(FilterType::Select, ['paid' => __('Paid'), 'pending' => __('Pending')])
        ->format(fn (string $value) => view('cells.status', ['status' => $value])),

    Column::make('total_cents', __('Total'))
        ->sortable()
        ->numeric()
        ->format(fn (int $cents) => 'R$ '.number_format($cents / 100, 2, ',', '.')),

    Column::make('created_at', __('Placed'))->sortable()->filterable(FilterType::Date),
])->defaultSort('created_at', 'desc');

return view('orders.index', ['table' => $table]);
```

```blade
<x-me::table :table="$table" striped />
```

### Column

| | |
|---|---|
| `make($key, $label = null)` | Label defaults to a humanised key |
| `sortable()` | Adds the sort link and allows the column in `ORDER BY` |
| `searchable()` | Includes it in the quick search box |
| `filterable(FilterType, $options = [])` | Offers it in the filter builder |
| `numeric()` | Right-aligns and uses tabular figures |
| `align('start'\|'center'\|'end')` | |
| `field('orders.total')` | Database column, when it differs from the key |
| `format(fn ($value, $row) => …)` | String, `Htmlable` or a view |
| `view('cells.status')` | Renders the cell through a Blade view |
| `sortUsing` / `filterUsing` / `searchUsing` | Take over for relations and joins |

### Table

| | |
|---|---|
| `make($query, $columns)` | Eloquent builder, query builder or relation |
| `defaultSort($key, $direction)` | |
| `perPage($n)` / `perPageOptions([…])` | |
| `name('orders')` | Namespaces the query keys, for two tables on one page |
| `forRequest($request)` | Mostly for tests |

`<x-me::table>` takes `striped`, `compact`, `:search`, `:filters`, `:per-page`,
plus `empty` and `actions` slots.

### Escape hatches

Anything that is not a plain column takes a closure, and the rest of the table
keeps working:

```php
Column::make('customer', __('Customer'))
    ->sortable()
    ->sortUsing(fn ($query, string $direction) => $query
        ->orderBy(Customer::select('name')->whereColumn('id', 'orders.customer_id'), $direction))
    ->searchUsing(fn ($query, string $term) => $query
        ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$term}%")));
```

### Livewire

The same table, without the page reload. Declare the query and the columns; the
sorting, searching, filtering and paging come with it:

```php
use MyEyes\Livewire\TableComponent;

class UsersTable extends TableComponent
{
    protected function query(): Builder
    {
        return User::query();
    }

    protected function columns(): array
    {
        return [
            Column::make('name', __('Name'))->sortable()->searchable(),
            Column::make('status', __('Status'))
                ->filterable(FilterType::Select, ['active' => __('Active')]),
        ];
    }
}
```

```blade
<livewire:users-table />
```

State lives in Livewire properties and syncs to the **same query string keys**
the Blade table uses, so a URL from one opens the same view in the other. It is
still the server that decides: a property naming a column that is not sortable,
or an operator its type does not offer, is dropped exactly as a crafted URL
would be.

Name the table when a page has two of them — `protected function tableName(): ?string`
— and every key is prefixed, `page` included.

When the table is one part of a bigger component, use the trait directly:

```php
class Dashboard extends Component
{
    use MyEyes\Livewire\InteractsWithTable;

    public function table(): Table
    {
        return $this->buildTable(User::query(), [/* columns */]);
    }
}
```

### Vue

`@my-eyes/vue` ships the same table for Vue 3 — server-paginated, with pages
already fetched served from memory and rows outside the viewport kept out of
the DOM. See [packages/vue/README.md](packages/vue/README.md).

```vue
<MeTable endpoint="/users/table">
  <template #cell:status="{ value }">
    <MeBadge :variant="value === 'active' ? 'success' : 'danger'">{{ value }}</MeBadge>
  </template>
</MeTable>
```

Vue fetches rows instead of receiving markup, so the table serialises itself and
**your** application serves it — the package still ships no routes:

```php
Route::get('/users/table', function () {
    Gate::authorize('viewAny', User::class);

    return Table::make(User::query(), $columns)->defaultSort('created_at', 'desc');
})->middleware('auth');
```

The payload carries only declared columns, and cell values as data rather than
markup. A column that renders markup must say so with `->html()`; without it,
serialising throws instead of quietly turning escaped output into raw output on
the client. The contract is documented in
[docs/policies/table-payload.md](docs/policies/table-payload.md).

## Advanced filters

Field / operator / value rows, joined by one **and/or** conjunction chosen on
the second row. Operators come from the column's `FilterType`, so a date column
offers ranges and a select offers "is one of".

> **Why one conjunction instead of one per row?** Mixing them in a flat list is
> ambiguous: `A or B and C` reads as `A or (B and C)` in SQL but as
> `(A or B) and C` to most people. Resolving that honestly needs nested groups
> with visible parentheses; until the UI has those, one conjunction is the
> truthful option.

**Only columns declared `filterable()` can be filtered, and only with operators
their own type offers.** A crafted URL asking to filter on `password`, or to run
`contains` against a select, is dropped rather than executed. The same applies
to sorting. User-typed `%` and `_` are escaped so they match literally.

**Dates are filtered by whole days.** An `<input type="date">` submits
`2026-01-31` with no time, which against a datetime column means midnight — so a
naive `between` silently drops everything recorded during the final day. Each
operator is widened to the day's real boundaries instead: `between` is inclusive
at both ends, `is` matches anywhere inside the day, `after` starts once the day
is over. A value that already carries a time is used verbatim.

Filters live in the URL:

```
?filters[0][field]=status&filters[0][operator]=eq&filters[0][values][0]=paid&conjunction=or
```

## Confirmation modal

Built on the native `<dialog>`, so the backdrop, Escape handling, focus trapping
and page inertness come from the browser rather than from JavaScript.

```blade
<x-me::button variant="danger" data-me-modal-open="delete-order">
    {{ __('Delete') }}
</x-me::button>

<x-me::modal
    id="delete-order"
    variant="danger"
    :title="__('Delete this order?')"
    :confirm="__('Delete order')"
    :cancel="__('Keep it')"
    :action="route('orders.destroy', $order)"
    method="DELETE"
>
    {{ __('Every line item goes with it. This cannot be undone.') }}
</x-me::modal>
```

- `confirm` alone gives a single acknowledge button; add `cancel` for the pair.
- `variant` colours the icon and the confirm button together, so a destructive
  confirmation cannot end up with a friendly blue button.
- `action` makes confirming submit a form (CSRF and method spoofing included).
- `static` refuses dismissal by backdrop or Escape — pair it with a `cancel`.
- Cancel takes initial focus, so a stray Enter dismisses rather than confirms.

## Toasts

```php
return back()->with('success', __('Order created'));
return back()->with('toast', [
    'variant' => 'danger',
    'title'   => __('Upload failed'),
    'text'    => __('The file was rejected.'),
    'duration' => 0,          // stays until dismissed
]);
```

```js
myEyes.toast({ variant: 'success', title: 'Saved', text: 'Your changes are live.' })
```

Drop the container once in your layout: `<x-me::toasts position="top-end" />`.
Positions are `top|bottom` × `start|center|end`; bottom stacks reverse so the
newest sits nearest the edge.

**The progress bar is the timer.** The countdown is a CSS animation and the
dismissal is scheduled from that animation ending — the bar can never disagree
with when the toast closes, and hovering pauses both.

## Tooltip

```blade
<x-me::tooltip text="{{ __('Delete order') }}" placement="top">
    <x-me::button variant="ghost" icon="x" />
</x-me::tooltip>
```

One element is created for the whole page and positioned against the viewport,
so it is never clipped by an `overflow: hidden` ancestor — the usual way
tooltips break inside tables. It flips when it would run off screen, and the
arrow keeps pointing at the trigger. Shown on hover *and* keyboard focus.

## Progress

```blade
<x-me::progress :value="72" variant="success" label="Uploading" show-value />
<x-me::progress variant="primary" size="sm" />              {{-- indeterminate --}}
<x-me::progress-ring :value="64" variant="success" size="lg" />
```

## Translations

English and pt-BR ship in the box, under the `my-eyes::` namespace:

```bash
php artisan vendor:publish --tag=my-eyes-lang
```

Three files: `ui.php` (components, layout chrome, error pages), `filters.php`
(table and filter builder), `auth.php` (starter kit screens).

Some strings are rendered by the browser, not by Blade — a toast's close button,
upload validation, the filter builder's labels. `<x-me::translations />` emits
the current locale's copies as JSON (inside a `script` tag, so no relaxed CSP is
needed) and the bindings pick them up. The bundled layouts already include it.

For **Vue, React or Inertia**, hand the same array to the client:

```php
Inertia::share('myEyesMessages', fn () => \MyEyes\Support\Messages::forJavaScript());
```

```js
import { configureMessages } from '@my-eyes/core'

configureMessages(page.props.myEyesMessages)
```

A test asserts the PHP and TypeScript key sets stay identical, so a message
added on one side without the other fails CI rather than silently falling back.

## Admin layout

```blade
<x-me::layouts.admin :heading="__('Dashboard')">
    <x-slot:nav>
        <x-me::nav.section>
            <x-me::nav.item :href="route('dashboard')" icon="layout-dashboard">
                {{ __('Dashboard') }}
            </x-me::nav.item>

            <x-me::nav.group :label="__('Settings')" icon="settings">
                <x-me::nav.subitem :href="route('settings.general')">
                    {{ __('General') }}
                </x-me::nav.subitem>
            </x-me::nav.group>
        </x-me::nav.section>
    </x-slot:nav>

    <x-slot:user>
        <x-me::user-menu :name="auth()->user()->name" :email="auth()->user()->email" />
    </x-slot:user>

    {{-- page content --}}
</x-me::layouts.admin>
```

Below 1024px the sidebar is a drawer; above it, a column that collapses to an
icon rail (remembered between visits). Groups containing the current page open
themselves.

## Starter kit pages

Login, register, forgot/reset password, verify email, confirm password,
dashboard and profile — plus 401, 403, 404, 419, 429, 500 and 503.

They are **views only**: no routes, controllers or migrations. They target the
conventional Laravel route names (`login`, `password.request`, `profile.edit`),
so publish them over a Breeze or Fortify install and the wiring is already
there. `my-eyes` deliberately does not ship an auth backend.

## Publishing

```bash
php artisan vendor:publish --tag=my-eyes-config      # config/my-eyes.php
php artisan vendor:publish --tag=my-eyes-lang        # translations
php artisan vendor:publish --tag=my-eyes-errors      # error pages
php artisan vendor:publish --tag=my-eyes-pages       # starter kit screens
php artisan vendor:publish --tag=my-eyes-components  # override components
```

## Development

```bash
composer install && npm install

composer test          # Pest, against a real in-memory database
composer lint          # Pint
composer analyse       # PHPStan level 5
composer check         # all three

npm run typecheck      # strict tsc over the core
npm run build          # emit dist/ and the standalone bundle
npm run css:build      # compile the stylesheet through Tailwind

php playground/build.php   # render the showcase to playground/index.html
```

The showcase is generated from the real Blade components against a real
database, so it cannot drift from what the package produces. CI rebuilds it on
every push.

## Roadmap

Blade + JS ✅ → Livewire ✅ → Vue ✅ → React. The point of keeping the design system
in CSS and the behaviour in framework-free TypeScript is that each of those is a
thin markup layer, not a rewrite.

The specification lives in [docs/](docs/) — the renderers are written there
first, then built. [docs/llm-reference.md](docs/llm-reference.md) is the whole
public surface in one file, written to be fed to a coding assistant so it stops
inventing APIs this package does not have.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © [Márcio Elias](https://github.com/marcioelias)
