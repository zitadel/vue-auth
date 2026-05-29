---
title: Components
group: Vue
---

# Bundled components

The library ships five components, exported from
`@zitadel/vue-auth/components`. The `zitadelRoutes` bundle wires them under
the `/auth` prefix automatically, so you rarely import them directly, but
you can if you want to mount them at custom paths.

```ts
import {
  SignIn,
  SignInCallback,
  SignInError,
  SignOutCallback,
  Account,
} from '@zitadel/vue-auth/components';
```

## `SignIn`

Renders the sign-in entry point and triggers a redirect to the provider.
Mounted at `/auth/signin` by the bundled routes.

## `SignInCallback`

Handles the return from the authorize endpoint. This is your
`redirect_uri` target, mounted at `/auth/callback`. It completes the PKCE
code exchange and then sends the user on.

## `SignInError`

Displays an authentication error. Mounted at `/auth/error`.

## `SignOutCallback`

Handles the return from the logout endpoint. This is your
`post_logout_redirect_uri` target, mounted at `/auth/logout/callback`.

## `Account`

Shows the signed-in user's account details. Mounted at `/auth/account`
and marked `meta.requiresAuth`, so a guard created with
`createAuthGuard()` protects it.
