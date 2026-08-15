# Livewire renderer

Status: draft

## Purpose

Give Livewire applications the my-eyes table without a full page load: sorting,
searching, filtering and paging happen over the wire, the URL stays shareable,
and the markup is the same `me-*` markup Blade emits.

Everything that is not the table already works under Livewire today — the core
JavaScript re-initialises itself on `livewire:navigated` and after a morph
(`packages/core/src/index.ts`). This feature is therefore about **state**, not
about re-implementing components.

## Actors

Application developers building a Livewire page. No end-user permissions of
its own; whatever the host component authorises is what applies.

## Business Rules

- **BR-01** — The Livewire table reuses `MyEyes\Table\Table` for query
  building. No filtering, sorting or search logic is reimplemented.
- **BR-02** — Table state lives in Livewire properties: `sort`, `direction`,
  `search`, `perPage`, `filters`, `conjunction`, `page`.
- **BR-03** — Those properties are URL-synced, using the same query string keys
  the Blade table uses, so a URL produced by one renders the same table in the
  other.
- **BR-04** — A named table prefixes its keys exactly as `Table::parameter()`
  does, so two Livewire tables coexist on one page.
- **BR-05** — Changing sort, search, filters or page size resets to page 1.
- **BR-06** — The state reaching the query is re-validated server-side through
  the existing `Table` and `FilterSet` code paths. A property set to a
  non-filterable column, an operator the column's type does not offer, or a
  page size outside the offered options is discarded, not trusted.
- **BR-07** — Columns are declared in PHP by the host component, identically to
  the Blade table, including the `sortUsing` / `filterUsing` / `searchUsing`
  closures.
- **BR-08** — Search is debounced client-side; the server sees one round trip
  per pause, not one per keystroke.
- **BR-09** — The package registers its Livewire components only when Livewire
  is installed. A project without Livewire loads the package unchanged and
  sees no new bindings.
- **BR-10** — Livewire 3 and Livewire 4 are both supported.

## Data

No new entities. New PHP surface:

| Symbol | Purpose |
|---|---|
| `MyEyes\Livewire\InteractsWithTable` | Trait holding the URL-synced properties and building the `Table` |
| `MyEyes\Livewire\TableComponent` | Abstract component: declare `query()` and `columns()`, get a table |
| `resources/views/livewire/table.blade.php` | The wire-bound markup |

The trait builds a `Request` from its own properties and hands it to
`Table::forRequest()`, which is why BR-01 costs nothing.

## Contracts

```php
use MyEyes\Livewire\TableComponent;
use MyEyes\Table\Column;

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
                ->filterable(FilterType::Select, ['active' => 'Active']),
        ];
    }
}
```

```blade
<livewire:users-table />
```

Escape hatch, for a component that already exists:

```php
class Dashboard extends Component
{
    use InteractsWithTable;

    public function table(): Table
    {
        return $this->buildTable(User::query(), [/* columns */]);
    }
}
```

## States

Property changes and what they reset:

| Changed | Resets page | Drops nothing else |
|---|---|---|
| `sort`, `direction` | yes | — |
| `search` | yes | — |
| `filters`, `conjunction` | yes | — |
| `perPage` | yes | — |
| `page` | — | — |

## Acceptance Criteria

- **AC-01** — Given a Livewire table, when a sortable column header is
  clicked, then the rows re-order without a page load and `sort`/`direction`
  appear in the URL.
- **AC-02** — Given a sorted table on page 3, when the sort column changes,
  then the table shows page 1.
- **AC-03** — Given a URL carrying `?sort=name&direction=desc&q=ana`, when the
  Livewire page loads, then the table is already sorted and searched.
- **AC-04** — Given a filter set built in the panel, when it is applied, then
  only matching rows show and the conditions survive a browser refresh.
- **AC-05** — Given a `filters` property naming a column that is not
  filterable, when the component renders, then that condition is ignored and
  the remaining ones still apply.
- **AC-06** — Given two named Livewire tables on a page, when one is sorted,
  then the other is unaffected.
- **AC-07** — Given a project without Livewire installed, when the service
  provider boots, then no Livewire component is registered and no error is
  raised.
- **AC-08** — Given a Livewire re-render, when the DOM is morphed, then
  dropdowns, tooltips and the filter panel are still wired.

## Out of Scope

- Row selection and bulk actions — a separate feature
- Inline editing
- Client-side page caching, which is a Vue/React concern
  (`vue-package.md`, BR-06)
- Livewire versions before 3

## Open Questions

None blocking.
