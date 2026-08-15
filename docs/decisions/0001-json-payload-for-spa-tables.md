# 1. A JSON payload, served by the application, feeds the Vue and React tables

Date: 2026-08-14

Status: accepted

## Context

The Blade and Livewire tables run on the server: the query is built, the rows
are rendered, and the markup is sent. Vue and React cannot work that way. They
need the rows as data.

That collides with D5 (`01-architecture.md`): the Laravel package ships views
only — no routes, no controllers. A table component that fetches from
`/my-eyes/table/...` would need the package to own a route, and would drag
authorisation, rate limiting and route naming into a library that has
deliberately stayed out of all three.

Three options were considered:

1. **Inertia partial reloads.** The controller passes the page as a prop; the
   component calls `router.reload({ only: ['table'] })`. No endpoint, no route.
   But it binds the renderers to Inertia, which not every target application
   uses, and it makes the table's data flow invisible to a plain SPA.
2. **A package-owned JSON endpoint.** Simplest for the consumer, but reverses
   D5 and puts the package in charge of authorising access to arbitrary
   queries — exactly the responsibility it should not hold.
3. **A payload the application serves.** `Table` serialises itself; the
   application writes the route.

## Decision

Option 3.

`MyEyes\Table\Table` gains `toPayload(): array` and `toJson(): JsonResponse`.
The application exposes whatever route it wants and applies its own middleware,
policies and rate limits there.

```php
Route::get('/users/table', function () {
    Gate::authorize('viewAny', User::class);

    return Table::make(User::query(), $columns)
        ->defaultSort('created_at', 'desc')
        ->toJson();
})->middleware('auth');
```

The Vue and React components take an `endpoint` and speak that contract.

## Consequences

Good:

- D5 survives. The package still ships no routes.
- Authorisation stays where it belongs — in the application, on its own route,
  visible in `route:list`.
- The payload is a real contract, versioned and fixture-tested, shared by both
  SPA renderers.
- It works for Inertia applications too: the component fetches directly rather
  than going through a partial reload, so nothing about Inertia is assumed.

Bad:

- The consumer writes about five lines of routing that a package-owned endpoint
  would have saved. Documented in the README with a copy-pasteable example.
- Two places now describe the same table: the page controller and the endpoint.
  Mitigated by extracting the column definitions into a method both call.

## What would reverse this

If Inertia became a hard requirement of the starter kit, option 1 would become
the better default and this would be superseded rather than edited.
