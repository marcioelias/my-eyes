# Authentication screens

Status: implemented

## Purpose

Fortify is headless: it ships the routes, the controllers and the actions, and
no screens at all. This package fills that gap — that is the reason it exists
(`00-overview.md`).

Until now it filled it partially. Six Blade screens covered password login,
registration, reset, verification and password confirmation. Nothing covered
two-factor authentication, nothing covered passkeys, no screen showed a user's
avatar, and none of it existed for Vue, so an Inertia application got the
components and had to assemble the screens itself.

This feature specifies the complete set, in both renderers, against the
endpoints Fortify actually exposes.

## Actors

- **The person signing in.** Password, passkey, or password followed by a
  two-factor challenge.
- **The signed-in account holder**, managing their own security: enabling and
  disabling two-factor, registering and removing passkeys, changing the avatar,
  name, email and password, deleting the account.
- **The host application**, which owns every route, controller, policy and
  storage decision behind these screens and always has.

## Business Rules

### The package's boundary is unchanged

- **BR-01** — Views only. No route, controller, migration, model or storage
  driver ships with these screens (D4, `01-architecture.md`). They target the
  conventional Laravel and Fortify route names and URLs, and every one of those
  targets is overridable — a Blade page is published and edited, a Vue screen
  takes the URL as a prop.
- **BR-02** — Blade screens are **published and owned**: `my-eyes-pages` writes
  them into the application, which then edits them freely. Vue screens are
  **npm exports** configured by props. They are the same screen twice, not two
  designs, and both render the markup `@my-eyes/core/css` already styles.
- **BR-03** — A Vue screen never performs a request and never navigates. It
  emits `submit` with a plain object and the application does the rest. This is
  D5 (`0001-json-payload-for-spa-tables.md`) applied to authentication: the
  package would otherwise need to know about Inertia, CSRF and redirects, none
  of which are its business. Recorded as
  `0003-vue-screens-emit-instead-of-submitting.md`.

### The layout

- **BR-18** — Every full-page screen renders through one layout, which is two
  halves at 64rem and up: the form on one side, a visual on the other. Below
  that it is one column, and the visual half is `display: none` rather than
  hidden by opacity or position — a phone must not download an image it will
  never see.
- **BR-19** — The visual half never needs configuring to look finished. With no
  `image` it is a gradient built from the role tokens, and with no `tagline` the
  brand name fills it. Remapping the roles moves it, like everything else.
- **BR-20** — The form column is first in the DOM whichever side it is placed
  on. `reverse` moves the visual half with CSS `order`, so a keyboard or a
  screen reader always reaches the fields before the decoration.
- **BR-21** — A photograph is an `<img>` with an empty `alt`, not a
  `background-image`: it is decorative, it must not be announced, and the URL
  must never be interpolated into CSS. Text over it gets a scrim rather than
  the gradient, which would compete with the picture.
- **BR-22** — On two halves the panel is the container, so the card's border,
  fill and padding are reset — a box inside a box. On one column the card keeps
  its chrome, because there the outline is what gives the form an edge.

### Two-factor

- **BR-04** — Two-factor is Fortify's, used as it is. The screens speak to
  `POST`/`DELETE /user/two-factor-authentication`,
  `POST /user/confirmed-two-factor-authentication`,
  `GET /user/two-factor-qr-code`, `GET /user/two-factor-secret-key`,
  `GET`/`POST /user/two-factor-recovery-codes` and `POST /two-factor-challenge`.
  No endpoint is invented and none is renamed.
- **BR-05** — The setup card follows Fortify's three states and never shows a
  state that does not exist: **off**, **pending confirmation** (enabled but not
  yet confirmed — QR code, secret and the confirmation field), and **on**
  (recovery codes, regenerate, disable).
- **BR-06** — The QR code is an SVG string produced by Fortify's own endpoint.
  It is the one place in this package where data is rendered as markup, it is
  same-origin by construction, and it is passed in explicitly by the
  application rather than fetched by the component. Documented at the call
  site, in both renderers.
- **BR-07** — The challenge screen accepts either a six-digit code or a
  recovery code, one at a time, and switching between them clears the field
  that is not in play. Fortify distinguishes them by field name — `code` versus
  `recovery_code` — so submitting both is what produces the confusing failure
  this rule exists to prevent.
- **BR-08** — Recovery codes are shown as a block that can be copied in one
  action. The screen states that regenerating invalidates the previous set.

### Passkeys

- **BR-09** — The WebAuthn ceremony lives in `@my-eyes/core`, once, as headless
  behaviour plus a DOM binding — never in a Blade page or a Vue component. Vue
  and Blade call the same function, which is the whole reason the behaviour
  layer is framework-free (D3).
- **BR-10** — No WebAuthn library is added. Browsers convert the JSON
  themselves through `PublicKeyCredential.parseCreationOptionsFromJSON()` and
  `.toJSON()`, with a base64url fallback for those that do not. Recorded as
  `0002-passkeys-without-a-webauthn-library.md`.
- **BR-11** — Passkey affordances are feature-detected. A browser without
  `navigator.credentials` or without a platform authenticator never sees a
  passkey button, and the password form is never removed to make room for one.
- **BR-12** — A cancelled ceremony is not an error. `NotAllowedError` and
  `AbortError` leave the screen exactly as it was, silently. Everything else
  surfaces as a message on the screen the user is already looking at.
- **BR-13** — Passkeys serve three flows and each has its own endpoint pair:
  login (`/passkeys/login/options`, `/passkeys/login`), registration
  (`/user/passkeys/options`, `/user/passkeys`) and password confirmation
  (`/passkeys/confirm/options`, `/passkeys/confirm`). Deleting is
  `DELETE /user/passkeys/{id}`.

### Avatar

- **BR-14** — The avatar is displayed from a URL the application supplies and
  falls back to initials when there is none. `x-me::avatar` and `MeAvatar`
  already do this; the profile screen adds the field that changes it.
- **BR-15** — Upload is a file input named `avatar`, and that is the entire
  contract. The package does not store, resize, crop or validate the image
  beyond the client-side hints `x-me::upload` already gives.

### Everywhere

- **BR-16** — Every string is translatable, in `my-eyes::auth` for the screens
  and through `Messages::forJavaScript()` for anything the browser renders.
  English and pt-BR ship complete.
- **BR-17** — Each screen degrades: with JavaScript off, the Blade screens
  still submit their forms. Only the passkey affordance disappears, which
  BR-11 already requires.

## Data

One screen, two renderers. The Blade column is what `my-eyes-pages` publishes;
the Vue column is what `@my-eyes/vue` exports.

| Screen | Blade page | Vue export |
|---|---|---|
| Sign in (+ passkey) | `pages/auth/login` | `MeLoginScreen` |
| Register | `pages/auth/register` | `MeRegisterScreen` |
| Forgot password | `pages/auth/forgot-password` | `MeForgotPasswordScreen` |
| Reset password | `pages/auth/reset-password` | `MeResetPasswordScreen` |
| Confirm password (+ passkey) | `pages/auth/confirm-password` | `MeConfirmPasswordScreen` |
| Verify email | `pages/auth/verify-email` | `MeVerifyEmailScreen` |
| Two-factor challenge | `pages/auth/two-factor-challenge` | `MeTwoFactorChallengeScreen` |
| Profile: name, email, avatar | `pages/profile/partials/update-profile-information` | `MeProfileInformationCard` |
| Profile: password | `pages/profile/partials/update-password` | `MeUpdatePasswordCard` |
| Profile: two-factor | `pages/profile/partials/two-factor` | `MeTwoFactorCard` |
| Profile: passkeys | `pages/profile/partials/passkeys` | `MePasskeysCard` |
| Profile: delete account | `pages/profile/partials/delete-user` | `MeDeleteAccountCard` |

A passkey, as these screens need it:

| Field | Type | Source |
|---|---|---|
| `id` | string | Fortify |
| `name` | string | The user named it at registration |
| `last_used_at` | string \| null | Fortify, already formatted by the application |
| `created_at` | string \| null | idem |

## Contracts

### Fortify endpoints the screens target

| Flow | Method and path |
|---|---|
| Two-factor: enable | `POST /user/two-factor-authentication` |
| Two-factor: disable | `DELETE /user/two-factor-authentication` |
| Two-factor: confirm | `POST /user/confirmed-two-factor-authentication` (`code`) |
| Two-factor: QR code | `GET /user/two-factor-qr-code` |
| Two-factor: secret | `GET /user/two-factor-secret-key` |
| Two-factor: recovery codes | `GET` / `POST /user/two-factor-recovery-codes` |
| Two-factor: challenge | `POST /two-factor-challenge` (`code` \| `recovery_code`) |
| Passkey: login options | `GET /passkeys/login/options` |
| Passkey: login | `POST /passkeys/login` (`credential_response`) |
| Passkey: register options | `GET /user/passkeys/options` |
| Passkey: register | `POST /user/passkeys` (`credential_response`, `name`) |
| Passkey: confirm options | `GET /passkeys/confirm/options` |
| Passkey: confirm | `POST /passkeys/confirm` (`credential_response`) |
| Passkey: delete | `DELETE /user/passkeys/{id}` |

### `@my-eyes/core`

```ts
isPasskeySupported(): boolean
isPasskeyAutofillSupported(): Promise<boolean>

registerPasskey(options?: PasskeyEndpoints): Promise<Response>
authenticateWithPasskey(options?: PasskeyEndpoints): Promise<Response>
confirmWithPasskey(options?: PasskeyEndpoints): Promise<Response>

initPasskeys(root?: ParentNode): void
```

`PasskeyEndpoints` carries `optionsUrl`, `url`, `name` and `fetcher`, all
optional; the defaults are Fortify's paths. Each function throws
`PasskeyCancelled` when the person dismissed the browser prompt and
`PasskeyError` for everything else, so BR-12 is a `catch`, not a convention.

### Vue screens

Every screen emits `submit` with a plain object and takes `errors`,
`processing` and `status`:

```vue
<MeLoginScreen
  :errors="errors"
  :status="status"
  :processing="form.processing"
  :can-register="true"
  register-url="/register"
  forgot-url="/forgot-password"
  @submit="payload => router.post('/login', payload)"
/>
```

`errors` is Laravel's error bag shape — `Record<string, string>` — so an
Inertia page passes `$page.props.errors` straight through.

## States

Two-factor, as the setup card sees it:

```
off ──enable──▶ pending ──confirm(code)──▶ on
 ▲                 │                        │
 └────disable──────┴────────disable─────────┘
```

The challenge screen has two, and the toggle between them clears the other
field (BR-07):

```
code ⇄ recovery code
```

## Acceptance Criteria

- **AC-01** — Given a browser without WebAuthn, when the sign-in screen
  renders, then no passkey button is shown and the password form is unchanged.
- **AC-02** — Given the person dismisses the browser's passkey prompt, when the
  ceremony aborts, then no error is displayed and the screen is untouched.
- **AC-03** — Given Fortify's creation options JSON, when the ceremony runs in
  a browser without `parseCreationOptionsFromJSON`, then the fallback produces
  the same `ArrayBuffer` fields the native parser would.
- **AC-04** — Given two-factor is pending confirmation, when the card renders,
  then the QR code, the secret key and the confirmation field are shown, and
  the recovery codes are not.
- **AC-05** — Given two-factor is on, when the card renders, then recovery
  codes, regenerate and disable are shown, and the QR code is not.
- **AC-06** — Given the challenge screen, when the person switches to a
  recovery code, then the `code` field is cleared and only `recovery_code` is
  submitted.
- **AC-07** — Given a Vue screen, when its form is submitted, then it emits
  `submit` with the payload and performs no request of its own.
- **AC-08** — Given every Blade page under `pages/`, then a matching Vue screen
  is exported, and `RendererParityTest` fails if either side gains one the
  other does not have.
- **AC-09** — Given the profile screen with an avatar URL, when it renders,
  then the image is shown; given none, then the initials are.
- **AC-10** — Given no props at all, when a full-page screen renders, then it
  carries the split modifier, a visual half, and a tagline holding the brand
  name.
- **AC-11** — Given `reverse`, when the screen renders, then the form column
  still precedes the visual half in the DOM.
- **AC-12** — Given `:split="false"`, then neither the split modifier, the
  reverse modifier nor the visual half is rendered.
- **AC-13** — Given an `aside` slot, then its content replaces the tagline.

## Out of Scope

- Any backend: routes, controllers, Fortify actions, WebAuthn verification,
  avatar storage, resizing or cropping.
- Alternative second factors — SMS, email OTP, hardware tokens beyond WebAuthn.
- Teams, roles, invitations, or anything Jetstream ships and Fortify does not.
- Vue screens for the dashboard and the navigation partial. Those are examples
  of an application's own pages, not authentication.
- React. Specified separately (`react-package.md`), still not built.

## Open Questions

None. The two that blocked this were decided and recorded as ADRs 0002 and
0003.
