# React renderer

Status: approved

## Purpose

`@my-eyes/react` — the same components, the same table and the same
authentication screens as the Vue renderer, for React 19 frontends.

## Actors

Application developers building a React frontend against a Laravel backend,
with or without Inertia.

## Business Rules

- **BR-01 — Parity.** Every rule in `features/vue-package.md` (BR-01 to BR-14)
  and in `features/auth-screens.md` applies here unchanged, with `React`
  substituted for `Vue`. The renderers are the same feature expressed twice; a
  rule that holds in one and not the other is a defect in whichever is behind.
- **BR-02** — Both renderers speak `policies/table-payload.md`. Neither extends
  it privately.
- **BR-03** — `react` and `@my-eyes/core` are peer dependencies. No runtime
  dependency of its own; in particular no virtualisation library and no WebAuthn
  library — the row windowing and the passkey ceremony both live in core.
- **BR-04** — Components are function components with `forwardRef` where a DOM
  handle is meaningful (inputs, buttons, the table viewport).
- **BR-05** — Three translations, and they are the only intended differences
  between the packages:
  - a Vue scoped slot becomes a **render prop** (`renderCell`);
  - a Vue named slot becomes a **node prop** (`actions`, `footer`, `aside`,
    `nav`, `topbar`, `user`, `trigger`, `status`, `brand`, `sidebarFooter`);
  - a Vue emit becomes a **callback prop** (`onSubmit`, `onDismiss`,
    `onConfirm`, `onPasskey`), and a composable becomes a hook.
- **BR-06** — Every component is client-side. Components that touch the DOM
  carry `'use client'`, so the package can be consumed from a React Server
  Components tree without breaking the build.
- **BR-07** — Form controls are **controlled**, through `value` and
  `onValueChange(next)`. `onValueChange` receives the parsed value, never the
  event, which leaves the native `onChange` free to reach the DOM element for
  an application that needs it. This is the React translation of Vue's
  `v-model`; `checked` is `value` here too, as it is in the Blade components.
- **BR-08** — A screen's `onSubmit` receives the **payload**, not an event. A
  screen is not a DOM form, and BR-03 of `auth-screens.md` — the screen emits
  and the application performs the request — is what this preserves.

## Data

New package: `packages/react`, published as `@my-eyes/react`, versioned in
lockstep with `@my-eyes/core` and `@my-eyes/vue`.

| Group | Exports |
|---|---|
| Display | `MeAlert` `MeAvatar` `MeBadge` `MeBrand` `MeButton` `MeCard` `MeField` `MeIcon` `MeProgress` `MeProgressRing` `initials` |
| Form | `MeCheckbox` `MeInput` `MeNumeric` `MeRadio` `MeSelect` `MeSelectField` `MeSwitch` `MeTextarea` `MeUpload` |
| Overlay | `MeDropdown` `MeDropdownDivider` `MeDropdownHeader` `MeDropdownItem` `MeModal` `MeToasts` `MeTooltip` `useToasts` |
| Shell | `MeAdminLayout` `MeAuthLayout` `MeErrorLayout` `MeNavGroup` `MeNavItem` `MeNavSection` `MeNavSubitem` `MeThemeMenu` `MeThemeToggle` `MeUserMenu` |
| Table | `MeTable` `MeFilters` `MePagination` `useTable` |
| Theme | `useTheme` |
| Screens | `MeLoginScreen` `MeRegisterScreen` `MeForgotPasswordScreen` `MeResetPasswordScreen` `MeConfirmPasswordScreen` `MeVerifyEmailScreen` `MeTwoFactorChallengeScreen` `MeProfileInformationCard` `MeUpdatePasswordCard` `MeTwoFactorCard` `MePasskeysCard` `MeDeleteAccountCard` |

## Contracts

```tsx
import { MeTable, MeBadge } from '@my-eyes/react'

<MeTable
    endpoint="/users/table"
    renderCell={{
        status: (value) => (
            <MeBadge variant={value === 'active' ? 'success' : 'danger'}>
                {String(value)}
            </MeBadge>
        ),
    }}
/>
```

```ts
const { rows, columns, pagination, loading, error, sort, setSearch, goToPage } =
    useTable({ endpoint: '/users/table' })
```

```tsx
<MeLoginScreen
    errors={errors}
    canRegister
    image="/img/login.jpg"
    onSubmit={(payload) => router.post('/login', payload)}
/>
```

Props match `MeTable` in `features/vue-package.md` and the screens in
`features/auth-screens.md` exactly, under the three translations of BR-05.

## States

Identical to `features/vue-package.md` and `features/auth-screens.md`.

## Acceptance Criteria

- **AC-01** — AC-01 to AC-10 of `features/vue-package.md` hold for the React
  components, with `renderCell` in place of the `cell:<key>` slot in AC-09.
- **AC-02** — Given the shared payload fixtures, when both suites run, then the
  Vue and React tables produce equivalent markup for the same fixture.
- **AC-03** — Given React Strict Mode, when the table mounts, then the double
  invocation causes neither a duplicate request nor a cache inconsistency.
- **AC-04** — AC-01 to AC-13 of `features/auth-screens.md` hold for the React
  screens.
- **AC-05** — Given the Blade components and pages, then `RendererParityTest`
  counts three sets rather than two, and fails if React gains or lacks one.

## Out of Scope

Same as `features/vue-package.md`, plus:

- React Server Components rendering of the table itself (BR-06 only guarantees
  the package does not break such a build)
- React 18 and earlier
- A `.jsx` build for applications without a bundler. The standalone bundle in
  `@my-eyes/core` covers the no-bundler case, and it needs no framework.

## Open Questions

None.
