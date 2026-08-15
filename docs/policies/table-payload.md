# Policy — the table payload

The contract between `MyEyes\Table\Table` and any client that renders a table
from data rather than from server-rendered markup. Both the Vue and the React
renderers speak exactly this; neither may extend it privately.

## Shape

```jsonc
{
  "columns": [
    {
      "key": "name",
      "label": "Name",
      "align": "start",          // start | center | end
      "sortable": true,
      "searchable": true,
      "filterable": false,
      "html": false              // see "Cell values"
    }
  ],

  "rows": [
    { "name": "Ana Souza", "status": "Active", "created_at": "2026-02-01" }
  ],

  "sort": { "key": "created_at", "direction": "desc" },   // key may be null
  "search": "ana",

  "filters": {
    "conditions": [{ "field": "status", "operator": "equals", "values": ["active"] }],
    "conjunction": "and"
  },

  "schema": [ /* Column::toFilterSchema(), for the filter builder */ ],

  "pagination": {
    "page": 2,
    "perPage": 25,
    "total": 431,
    "lastPage": 18,
    "from": 26,       // null when the page is empty
    "to": 50          // null when the page is empty
  },

  "perPageOptions": [10, 25, 50, 100]
}
```

## Request

The client sends the **same query string keys the Blade table uses**. One
vocabulary, three renderers:

```
?sort=name&direction=asc&per_page=25&q=ana&page=2
&filters[0][field]=status&filters[0][operator]=equals&filters[0][values][0]=active
&conjunction=and
```

- **P-01** — A named table prefixes every key, exactly as
  `Table::parameter()` does.
- **P-02** — The server is the authority. A sort on a non-sortable column, an
  operator a column's type does not offer, or a page size outside
  `perPageOptions` is discarded, and the payload reports the state that was
  actually applied — not the state that was asked for.
- **P-03** — Because of P-02, the client renders its controls from the
  response, never from what it just sent. This is what keeps the UI honest
  when the server rejects something.

## Cell values

Rows carry **JSON-safe scalars**, not markup. `null` stays `null`.

- **P-04** — A column's value is `data_get($row, $key)`, passed through its
  `format()` closure when one is set.
- **P-05** — A column whose value resolves to a Blade view or `Htmlable` is a
  server-rendering construct and has no meaning here. Building a payload from
  one throws, naming the column. It does not silently disappear.
- **P-06** — A column may opt into HTML with `->html()`. Its values are then
  sent as strings the client renders as markup, and `columns[].html` is `true`
  so the client knows. This is an explicit, per-column decision by the
  developer, because it is the one place a table can inject markup into the
  page.
- **P-07** — Everything not marked `html` is rendered as text by the client.
  No client may render an unmarked value as markup.

## Authorisation

- **P-08** — The payload carries no authorisation of its own. The application
  owns the route and applies its middleware, policies and rate limiting there
  (`decisions/0001-json-payload-for-spa-tables.md`).
- **P-09** — The payload contains exactly the declared columns. A model
  attribute that is not a column never reaches the client, so `$hidden` is not
  the only thing standing between a password hash and a JSON response.

## Versioning

- **P-10** — The shape is additive. New keys may appear; existing keys do not
  change meaning or type. A breaking change is a major version of both the
  Composer and the npm packages, released together.
- **P-11** — Fixtures in `tests/Fixtures/payloads/` are the executable form of
  this policy. The Pest suite asserts the PHP emits them; the Vue and React
  suites render from them. Neither side may edit a fixture alone.
