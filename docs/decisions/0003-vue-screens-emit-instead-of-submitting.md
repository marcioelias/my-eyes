# 3. Vue screens emit their payload; the application performs the request

Date: 2026-08-17

Status: accepted

## Context

The Blade screens post forms. That works because the server renders them, the
session issues the CSRF token, and Laravel handles the redirect.

A Vue screen has three ways to do the same thing:

1. **A native `<form action method>`.** Works without Inertia and without
   JavaScript, but under Inertia every submit reloads the whole document, which
   defeats the reason the application chose Inertia.
2. **Inertia's `useForm` inside the component.** The least code for the
   consumer, and it makes `@inertiajs/vue3` a peer dependency of a package that
   also serves standalone SPAs (`standards/frontend/spa.md`). It would also put
   route names and CSRF handling inside the package, which D4 keeps out.
3. **Emit the payload.** The screen owns the markup, the validation display and
   the state; the application owns the request.

## Decision

Option 3. Every screen emits `submit` with a plain object, and takes `errors`,
`processing` and `status` back.

```vue
<MeLoginScreen
  :errors="errors"
  :processing="form.processing"
  @submit="payload => router.post('/login', payload)"
/>
```

This is the same shape the table already uses (ADR 0001): the package renders,
the application talks to the server. One rule, applied twice, rather than two
rules to remember.

## Consequences

- `@my-eyes/vue` stays free of Inertia, and the same screens work in a
  standalone SPA with `fetch`, or with Inertia's `useForm`, unchanged.
- The application writes one line per screen. That line is where the route name
  lives, which is where it belongs.
- Errors are passed in, not derived. The screens take Laravel's error-bag
  shape (`Record<string, string>`) so an Inertia page hands over
  `$page.props.errors` untouched.
- The passkey flows are the exception that proves the rule: they *do* talk to
  the server from the browser, because a WebAuthn ceremony is a round trip the
  application cannot perform on the screen's behalf. Those endpoints are props
  with Fortify's defaults, and the request goes through `@my-eyes/core`.

## What would reverse this

Inertia becoming the only target the package serves. If the standalone-SPA case
disappears, option 2 costs one peer dependency and saves every consumer a line
per screen. Until then the coupling buys nothing that the emit does not already
give.
