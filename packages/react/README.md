# @my-eyes/react

my-eyes components for React 19 — the same design system, the same behaviour,
the same server-driven table and the same authentication screens that the Blade,
Livewire and Vue renderers use.

The look lives in `@my-eyes/core`'s stylesheet and the behaviour in its
framework-free TypeScript. These components only emit the markup that stylesheet
expects, which is why a React button and a Blade button cannot drift apart — a
test in the repository counts the two sets, and the React and Vue sets against
each other.

## Install

```bash
npm install @my-eyes/react @my-eyes/core
```

`resources/css/app.css`:

```css
@import 'tailwindcss';
@import '@my-eyes/core/css';
```

Both `react` and `@my-eyes/core` are peer dependencies; the package ships no
runtime dependency of its own — no virtualisation library, and no WebAuthn
library.

## Three translations from the Vue package

Everything else is identical, including prop names and class names.

| Vue | React |
|---|---|
| scoped slot | render prop — `renderCell` |
| named slot | node prop — `actions`, `footer`, `aside`, `nav`, `user`, `trigger` |
| emit | callback prop — `onSubmit`, `onDismiss`, `onConfirm` |
| `v-model` | `value` + `onValueChange(next)` |
| composable | hook |

`onValueChange` receives the parsed value, never the event, which leaves the
native `onChange` free to reach the DOM element when you need it.

## Table

The table paginates **on the server**. The Laravel side serialises itself and
your application serves it — the PHP package ships no routes:

```tsx
import { MeTable, MeBadge } from '@my-eyes/react'

<MeTable
    endpoint="/users/table"
    renderCell={{
        status: (value) => (
            <MeBadge variant={value === 'active' ? 'success' : 'danger'}>{String(value)}</MeBadge>
        ),
    }}
/>
```

What the client adds is responsiveness, not a different data model: a page
already fetched comes back from memory, and rows outside the viewport are not in
the DOM. Strict Mode's double mount is handled — the state machine lives in
`@my-eyes/core` and is subscribed to through `useSyncExternalStore`.

For your own presentation, take the state and skip the markup:

```ts
const { rows, columns, pagination, loading, error, toggleSort } = useTable({
    endpoint: '/users/table',
})
```

## Authentication screens

Sign in, register, forgot and reset password, verify email, confirm password,
the two-factor challenge, and a card per profile section. A screen hands back a
payload and **never performs the request**:

```tsx
<MeLoginScreen
    errors={errors}
    canRegister
    image="/img/login.jpg"
    onSubmit={(payload) => router.post('/login', payload)}
/>
```

Two-factor and passkeys speak to Fortify's own endpoints. The WebAuthn ceremony
lives in `@my-eyes/core`, so the passkey button works the same here as it does in
Blade.

## Links under a router

Every component that renders a link takes `as`. Pass Inertia's `Link`, or your
router's, or navigation reloads the whole document:

```tsx
<MeNavItem as={Link} href="/domains" active>
    Domains
</MeNavItem>
```

## Server components

Every component that touches the DOM carries `'use client'`, so the package can
be imported from an RSC tree without breaking the build. The components
themselves are client components; the table is not rendered on the server.

## Translations

One translation file serves every renderer. Share
`MyEyes\Support\Messages::forJavaScript()` from Laravel and apply it once:

```ts
import { configureMessages } from '@my-eyes/core'

configureMessages(props.myEyesMessages)
```

## Documentation

The complete surface — every component, every prop, the payload shape and an
explicit list of what does *not* exist — is in the repository at
`docs/llm-reference.md`.

MIT © Márcio Elias
