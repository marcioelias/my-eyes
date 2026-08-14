# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[semantic versioning](https://semver.org/).

## [Unreleased]

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

[Unreleased]: https://github.com/marcioelias/my-eyes/commits/main
