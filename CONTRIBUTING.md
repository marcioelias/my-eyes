# Contributing

Thanks for taking a look. Issues and pull requests are welcome.

## Getting set up

```bash
git clone git@github.com:marcioelias/my-eyes.git
cd my-eyes
composer install && npm install
```

Render the showcase to see everything at once:

```bash
npm run build && npm run css:build && php playground/build.php
open playground/index.html
```

## Before opening a pull request

```bash
composer check          # Pint, PHPStan and Pest
npm run typecheck
```

CI runs the same across PHP 8.2–8.4 and Node 20–24, plus a build of the
showcase, so a broken view is caught even when no test names it.

## How the pieces fit

| Path | What lives there |
|---|---|
| `packages/core/css/` | Design tokens and component styles — the single source of visual truth |
| `packages/core/src/headless/` | Framework-free logic (parsing, filtering, selection) |
| `packages/core/src/dom/` | Thin bindings that connect that logic to markup |
| `src/` | The Laravel package: service provider, table and filter classes |
| `resources/views/components/` | Blade components |
| `resources/lang/` | Translations |
| `tests/` | Pest tests, rendering the real components |

A few conventions worth knowing:

- **Styles go in `@layer components`.** Never in `utilities`, or an app's own
  utility class could stop overriding a component.
- **No dark-mode blocks in component CSS.** Colours come from role tokens that
  resolve per theme; if you need a dark variant, the token is missing.
- **Behaviour goes in `headless/` first.** Anything a Vue or React port would
  need has to be reachable without touching the DOM.
- **Bindings must be idempotent.** They run again after every Livewire update,
  so each one skips elements it already wired.
- **Strings are translated.** Blade uses `__('my-eyes::…')`; anything rendered
  by JavaScript goes through the message dictionary in `headless/i18n.ts` *and*
  `Messages::forJavaScript()` — a test fails if the two drift.

## Commits

[Conventional Commits](https://www.conventionalcommits.org), written in
English, with the affected area as the scope:

```
feat(table): add column visibility toggle
fix(filters): keep the panel open while a select is used
docs(readme): document the theming tokens
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`.

## Adding a component

1. Styles in `packages/core/css/components/`, imported from `css/index.css`.
2. Behaviour, if any, split between `headless/` and `dom/`, registered in
   `initMyEyes()`.
3. A Blade component in `resources/views/components/`.
4. Translatable strings in `resources/lang/{en,pt_BR}/ui.php`.
5. A test that renders it.
6. A card in `playground/showcase.blade.php`.

## Releasing

Bump `packages/core/package.json`, tag, push:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

The release workflow verifies the tag matches the package version, runs the full
suite, publishes `@my-eyes/core` to npm and notifies Packagist.
