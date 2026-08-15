# Overview

## Product

`my-eyes` is a component library and admin scaffolding for Laravel frontends.
It exists so that moving between Laravel frontend stacks — Blade, Livewire,
Inertia/Vue, Inertia/React — does not mean redesigning the application.

The promise is narrow and worth stating plainly: **one design system, one set of
behaviours, four renderers**. A button looks and behaves the same in all four,
because in all four it is the same CSS class driven by the same TypeScript.

## Scope

In scope:

- Design tokens and component styles, as semantic CSS classes
- Framework-free component behaviour, in TypeScript
- Renderers for Blade, Livewire, Vue and React
- A server-driven data table (sort, search, filter, paginate) in each renderer
- Admin shell, auth screens and error pages, as publishable starting points

Out of scope, permanently:

- Routes, controllers, migrations or an auth backend — the package ships views
  and behaviour, never application wiring (see `01-architecture.md`, D5)
- A CSS-in-JS or utility-prop styling API
- Server-side data fetching helpers beyond query building — the application
  owns its endpoints

## Glossary

| Term | Meaning |
|---|---|
| **Core** | `@my-eyes/core` — the CSS and the framework-free TypeScript |
| **Renderer** | A per-framework package that emits my-eyes markup: Blade, Livewire, Vue, React |
| **Headless** | Behaviour with no DOM assumptions: `packages/core/src/headless/` |
| **Binding** | The thin DOM layer wiring a headless model to real elements: `packages/core/src/dom/` |
| **Payload** | The JSON representation of a `Table` for a given request — the contract between the Laravel side and the Vue/React renderers |
| **Schema** | The filterable-column description the filter builder is driven by |
| **Condition** | One filter row: field, operator, values |

## Status

| Renderer | Status |
|---|---|
| Blade + core JS | implemented (`v0.1.0`) |
| Livewire | implemented — `features/livewire-package.md` |
| Vue | specified — `features/vue-package.md` |
| React | specified — `features/react-package.md` |
