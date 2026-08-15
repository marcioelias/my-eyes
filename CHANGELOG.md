# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[semantic versioning](https://semver.org/).

## [Unreleased]

## [0.3.0] - 2026-08-15

### Added

- The rest of the Vue renderer: every Blade component now has an equivalent —
  form controls, overlays, the admin shell and its navigation. Controls that
  carry behaviour delegate to `@my-eyes/core`, the same code Blade and Livewire
  run.
- The icon set as TypeScript (`@my-eyes/core`'s `icons`), with a test keeping
  it in step with the Blade component.
- The individual DOM bindings are exported from `@my-eyes/core`, so a component
  framework can bind the element it just mounted instead of scanning the page.

### Fixed

- `MeField` emitted `me-field__label`, `me-field__hint` and `me-field__error`,
  none of which exist in the stylesheet — labels, hints and errors rendered
  unstyled. It now emits `me-label`, `me-hint` and `me-error`, as Blade does.

## [0.2.0] - 2026-08-14

### Added

- Livewire renderer for the data table: `MyEyes\Livewire\TableComponent` and
  `MyEyes\Livewire\InteractsWithTable`, sharing the query building and the
  query string keys with the Blade table.
- `Table::toPayload()` and `Jsonable`, serialising a table for clients that
  render rows from data — the contract the Vue and React renderers will speak.
- `Column::html()`, opting a column into sending markup in that payload.
- `@my-eyes/vue` — the table for Vue 3, plus the primitives it leans on. Server
  pagination as everywhere else, with pages already fetched served from memory
  and rows outside the viewport kept out of the DOM.
- Headless table client and row windowing in `@my-eyes/core`, shared by every
  renderer that fetches rather than receives markup.
- Specification under `docs/`, written before the renderers it describes,
  including a reference for LLMs at `docs/llm-reference.md`.

## [0.1.0] - 2026-08-14

### Added

- Design tokens with role-based colours (`primary`, `secondary`, `success`,
  `danger`, `warning`, `info`), light and dark declared once through
  `light-dark()`.
- Form components: button, input, numeric, textarea, native select, custom
  select, checkbox, radio, switch, upload, field.
- UI components: alert, badge, avatar, card, dropdown, modal, tooltip, toasts,
  progress, progress ring, icon set, brand, theme toggle and menu, user menu.
- Admin shell with a mobile drawer, a collapsible desktop rail and one-level
  nav groups; auth and error layouts.
- Data table with sorting, quick search, page size and pagination, all driven
  by the query string.
- Advanced filter builder with per-type operators, an and/or conjunction, and
  whole-day handling for date comparisons.
- Three colour modes — system (default), light and dark.
- English and pt-BR translations, shared between Blade and the JavaScript layer.
- Starter kit screens (login, register, password reset, email verification,
  password confirmation, dashboard, profile) and 4xx/5xx error pages.
- Standalone browser bundle for projects without a bundler.

### Notes

- Requires Laravel 12.61.1+ or 13.12.0+. Every Laravel 11 release carries an
  unpatched security advisory, and 12.x was only patched in 12.61.1, so
  Composer refuses to install the earlier versions — supporting them would
  produce an unsolvable dependency set rather than a working install.

[Unreleased]: https://github.com/marcioelias/my-eyes/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/marcioelias/my-eyes/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/marcioelias/my-eyes/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/marcioelias/my-eyes/releases/tag/v0.1.0
