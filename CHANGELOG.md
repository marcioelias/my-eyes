# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[semantic versioning](https://semver.org/).

## [Unreleased]

## [0.5.0] - 2026-08-17

### Changed

- **The authentication screens are two halves on a wide screen** — form on one
  side, a visual on the other — and one column below 64rem. Any application on
  0.4.0 gets the new look on upgrade without changing a line; `:split="false"`
  restores the single centred column exactly.
- The form column grew to 27rem and carries its own padding and rhythm. The old
  screen put a 25rem card in the middle of an empty viewport, which reads as
  cramped however much padding it has: the space was on the outside, where it
  did nothing.
- Heading, subheading, brand and footer are left-aligned, with the heading on a
  `clamp()` scale. A centred heading over left-aligned fields was the detail
  that made the screen read as a greeting card.
- On two halves the card's border, fill and padding are reset — the panel is
  already the container. On one column the card keeps its chrome.

### Added

- `layouts.auth` and `MeAuthLayout` take `split`, `image`, `tagline` and
  `reverse`, plus an `aside` slot for the visual half. Every full-page screen
  forwards all of them.
- With no image the visual half is a gradient built from `--color-primary-*` and
  `--color-info-*`, so remapping the roles moves it too — and it costs no bytes.
  A photograph is an `<img>` with `alt=""` and a scrim, never a
  `background-image`: decorative, unannounced, and no URL interpolated into CSS.

## [0.4.0] - 2026-08-17

### Added

- The authentication screens now exist for Vue, not only Blade: `MeLoginScreen`,
  `MeRegisterScreen`, `MeForgotPasswordScreen`, `MeResetPasswordScreen`,
  `MeConfirmPasswordScreen`, `MeVerifyEmailScreen` and
  `MeTwoFactorChallengeScreen`, plus a card per profile section. A screen emits
  its payload and the application makes the request — the same rule the table
  already followed, so the package still knows nothing about Inertia, CSRF or
  routing.
- Two-factor authentication, in both renderers, against Fortify's endpoints. The
  card renders exactly one of Fortify's three states, and the challenge screen
  sends `code` or `recovery_code` and never both — sending both is what produces
  the failure that is hard to read.
- Passkeys, in both renderers. The WebAuthn ceremony lives once in
  `@my-eyes/core` — `registerPasskey()`, `authenticateWithPasskey()`,
  `confirmWithPasskey()` — and Blade drives it through `data-me-passkey`. No
  WebAuthn library was added: browsers convert the JSON themselves, and the
  fallback for those that do not is 80 lines and directly tested.
- A passkey affordance is never offered where it cannot work. Both renderers
  feature-detect, and a dismissed browser prompt leaves the screen untouched
  rather than reporting an error.
- The profile screen takes an avatar: a plain file field named `avatar`, with
  the initials fallback the `avatar` component already had. Storage stays the
  application's.
- `RendererParityTest` now counts the screens too, so a Blade page and its Vue
  screen cannot drift apart any more than the components can.

- 96 more icons — 128 in all — drawn for CRUD, ERP and CRM work: files,
  tables, commerce, people, charts, notifications and system. One family:
  24×24 grid, 1.75 stroke, round terminals.
- The set now has one source, `resources/icons/*.svg`, generated into PHP and
  TypeScript by `bin/build-icons.php`. It used to be written out twice with a
  test holding the two in step; the generator removes the class of bug that
  test existed to catch, and adding an icon is now dropping in an SVG.
- `registerIcons()` in `@my-eyes/core` and an `icons` key in
  `config/my-eyes.php`. An icon set is a styling decision, and this package's
  rule is that those belong to the application — so bring Font Awesome, or any
  other set, without the package depending on one.
- `bin/render-icons.php` renders a contact sheet at reading size and at 16px,
  and `docs/icon-authoring.md` documents the loop. Detail that survives one
  size and vanishes in the other is the most common mistake in an icon set.
- The showcase has an icon section.

### Fixed

- `MeIcon` rendered an empty `<svg>` for a name it did not know — a typo became
  an invisible button rather than an error. TypeScript cannot catch it, because
  the registry is open by design and the name is often computed, so it now
  warns once per unknown name. Blade throws while `app.debug` is on.
- Neither renderer had an escape hatch: an icon outside the set meant copying
  the `<svg>` wrapper by hand, and that copy stopped matching the day the
  design system changed it. Both now take the geometry as a slot, wrapper
  included.

## [0.3.2] - 2026-08-15

### Added

- `MeAuthLayout` and `MeErrorLayout`, the last two Blade components without a
  Vue equivalent. Like `MeAdminLayout` they render body content rather than a
  document.
- `MePagination` takes `hrefFor`, turning its items into real links so
  middle-click and "open in new tab" work. A plain click still fetches without
  reloading, and a modified click is left to the browser. Without it the items
  stay buttons, which is right when the pages have no addresses.
- A test that counts Blade components against Vue exports. Parity had been
  claimed by hand and was wrong; a count cannot drift.

## [0.3.1] - 2026-08-15

### Added

- `as` on every Vue component that renders a link — `MeNavItem`,
  `MeNavSubitem`, `MeDropdownItem`, `MeBrand` and `MeButton` with an `href`.
  It defaults to `'a'`, so nothing changes for Blade or for a Vue application
  without a router; pass Inertia's `Link` or `RouterLink` to keep navigation
  client-side. The package does not detect the router in use — that would tie
  it to one and break everyone on another.
- `startMyEyes()` re-binds after `inertia:navigate`, alongside the Livewire and
  Turbo hooks it already had. An Inertia page arrived unbound before, and every
  application had to call `initMyEyes()` itself.
- `MeModal` takes `v-model:open` and emits `close`, so a dialog can be driven
  from state instead of only from `data-me-modal-open`. Dismissal is reported
  however it happened, so a parent's boolean cannot be left stuck on true.
- `MeAlert` takes `v-model:visible` and emits `dismiss`.
- `MeDropdown` emits `update:open`.
- `useTheme()` — the colour scheme as reactive state, for a chart or a canvas
  that needs its own palette.
- `openModal` is exported from `@my-eyes/core`.

### Fixed

- A dismissible `MeAlert` carried `data-me-dismiss`, whose binding removes the
  element from the document. That element belongs to Vue, and tearing it out
  from underneath corrupts the next patch. Vue now owns the dismissal.

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

[Unreleased]: https://github.com/marcioelias/my-eyes/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/marcioelias/my-eyes/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/marcioelias/my-eyes/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/marcioelias/my-eyes/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/marcioelias/my-eyes/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/marcioelias/my-eyes/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/marcioelias/my-eyes/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/marcioelias/my-eyes/releases/tag/v0.1.0
