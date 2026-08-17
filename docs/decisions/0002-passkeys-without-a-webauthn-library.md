# 2. The passkey ceremony ships without a WebAuthn library

Date: 2026-08-17

Status: accepted

## Context

Passkeys need a browser ceremony: fetch the options from the server, call
`navigator.credentials.create()` or `.get()`, send the result back. The
awkward part has always been the encoding. The server speaks JSON with
base64url strings; the browser API speaks `ArrayBuffer`. Something has to
convert `challenge`, `user.id`, `excludeCredentials[].id`,
`allowCredentials[].id` on the way in, and `rawId`, `clientDataJSON`,
`attestationObject`, `authenticatorData`, `signature`, `userHandle` on the way
out.

`@simplewebauthn/browser` exists to do exactly that, is well maintained, and is
what most Laravel starter kits reach for.

Against it: `@my-eyes/core` has **zero runtime dependencies**. Not by accident
— it is a design-system package that a host application bundles, and every
dependency it adds is one the application cannot decline. Adding the first one
for ~80 lines of encoding is a poor trade.

And the encoding is no longer the whole story. Browsers ship
`PublicKeyCredential.parseCreationOptionsFromJSON()`,
`parseRequestOptionsFromJSON()` and `credential.toJSON()`, which do the
conversion natively. Where they exist, a library converts nothing at all.

## Decision

No dependency. `@my-eyes/core` uses the native JSON methods when the browser
has them, and falls back to hand-written base64url conversion when it does not.

The fallback is small, covered by tests against the same fixtures the native
path handles, and confined to one file — `headless/passkeys.ts`. Nothing else
in the package knows that WebAuthn has an encoding problem.

## Consequences

- The package keeps its zero-dependency guarantee, and an application that
  never renders a passkey button pays nothing for this.
- Browser quirks are ours. The known one is the `ArrayBuffer` conversion, which
  the fallback covers; the unknown ones will arrive as bug reports rather than
  as a dependency bump.
- The fallback path is dead code in current browsers, which makes it exactly
  the kind of code that rots unnoticed. It is therefore tested directly rather
  than through the ceremony, so the tests do not silently start exercising only
  the native path.
- Conditional mediation (passkey autofill on the sign-in field) is
  feature-detected the same way, and simply absent where unsupported.

## What would reverse this

A second genuinely hard browser incompatibility — one that cannot be fixed in
the fallback in a few lines. At that point the encoding is no longer an
implementation detail, and `@simplewebauthn/browser` becomes the cheaper
option. Reversing this is adding one dependency to `@my-eyes/core`, not a
redesign, which is what makes the decision safe to take now.
