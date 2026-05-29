# Vue Auth

A [Vue 3](https://vuejs.org/) integration that provides seamless
authentication for single-page applications using OpenID Connect with the
Authorization Code flow and PKCE, session management, and idiomatic Vue
composables and provide/inject.

This integration brings the power and flexibility of OIDC to Vue
applications with full TypeScript support, built on top of
[`oidc-client-ts`](https://github.com/authts/oidc-client-ts), and an API
surface compatible with `vue-oidc-context`.

### Why?

Modern single-page applications require robust, secure, and flexible
authentication systems. Integrating OIDC and session management with a Vue
application requires careful consideration of the browser redirect lifecycle,
silent token renewal, and TypeScript integration.

However, a direct integration isn't always straightforward. Different types
of applications or deployment scenarios might warrant different approaches:

- **Browser Redirect Lifecycle:** OIDC sign-in operates through full browser
  navigations to the identity provider and back. A proper integration should
  detect the authorization response on return, complete the code exchange, and
  clean the authorization parameters from the URL automatically.
- **Reactive Auth State:** Vue components need to react to authentication state
  without boilerplate. The `useAuth()` composable exposes a reactive ref with
  `isAuthenticated`, `isLoading`, `user`, and `error`.
- **Route Protection:** Many applications need to gate routes behind
  authentication. `withAuthenticationRequired()` wraps a component so that
  unauthenticated users are redirected to sign in before it renders.
- **Token Renewal:** Long-lived sessions require silent renewal in a hidden
  iframe. This integration wires the `oidc-client-ts` `UserManager` events so
  renewed tokens flow into auth state with zero manual subscription.

This integration, `@zitadel/vue-auth`, aims to provide the flexibility to
handle such scenarios. It allows you to leverage the OIDC ecosystem while
maintaining Vue best practices, ultimately leading to a more effective and
less burdensome authentication implementation.

## Installation

Install using NPM by using the following command:

```sh
npm install @zitadel/vue-auth oidc-client-ts
```

## Usage

To use this integration, wrap your application in the default-exported
`AuthProvider` with your OIDC configuration. Configuration field names follow
the `oidc-client-ts` `UserManagerSettings` shape.

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import AuthProvider from '@zitadel/vue-auth';

const onSigninCallback = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};
</script>

<template>
  <AuthProvider
    :authority="$env.VITE_ZITADEL_DOMAIN"
    :client_id="$env.VITE_ZITADEL_CLIENT_ID"
    :redirect_uri="$env.VITE_ZITADEL_CALLBACK_URL"
    :post_logout_redirect_uri="$env.VITE_ZITADEL_POST_LOGOUT_URL"
    scope="openid profile email offline_access"
    :on-signin-callback="onSigninCallback"
  >
    <router-view />
  </AuthProvider>
</template>
```

#### Using the Authentication System

The integration provides several composables, components, and helpers for
handling authentication:

**Composables and Components:**

- `AuthProvider` (default export): Provides auth state and the configured
  `UserManager` via provide/inject
- `useAuth()`: Returns a reactive ref of the current auth state and methods
- `useAutoSignin()`: Triggers sign-in automatically on first load
- `withAuthenticationRequired(Component)`: Guards a component behind sign-in
- `withAuthenticationRequiredAsync(loader)`: Same, for async components
- `hasAuthParams()`: Detects an OIDC authorization response in the current URL

**Bundled UI Components:**

- `SignIn`, `SignInCallback`, `SignInError`, `SignOutCallback`, `Account`

**Bundled Routes (optional, requires `vue-router`):**

- `zitadelRoutes`: A ready-made route bundle under `/auth` wiring the bundled
  components (`/auth/signin`, `/auth/callback`, `/auth/error`,
  `/auth/logout/callback`, `/auth/account`)
- `createAuthGuard()`: A navigation guard that protects routes flagged with
  `meta.requiresAuth`

**Basic Usage in a Component:**

```vue
<script setup lang="ts">
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();
</script>

<template>
  <div v-if="auth.isLoading">Loading...</div>
  <div v-else-if="auth.error">Oops... {{ auth.error.message }}</div>
  <div v-else-if="auth.isAuthenticated">
    Hello {{ auth.user?.profile.sub }}
    <button @click="auth.signoutRedirect()">Log out</button>
  </div>
  <button v-else @click="auth.signinRedirect()">Log in</button>
</template>
```

**Protecting a Route:**

```ts
import { withAuthenticationRequired } from '@zitadel/vue-auth';
import ProfileView from './ProfileView.vue';

export default withAuthenticationRequired(ProfileView);
```

##### Example: Advanced Configuration with Multiple Providers

This example shows how to wire the bundled `/auth` route bundle into
`vue-router`, while keeping your own application routes:

```ts
// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import { zitadelRoutes } from '@zitadel/vue-auth/routes';
import IndexView from './IndexView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: IndexView }, ...zitadelRoutes],
});
```

With the bundle mounted, configure your Zitadel application's redirect URIs to
`[origin]/auth/callback` and post-logout redirect to
`[origin]/auth/logout/callback`.

## Known Issues

- **Client-Side Only:** This integration runs entirely in the browser and
  performs the Authorization Code flow with PKCE. It does not require, and does
  not provide, a server-side session store.
- **Callback URLs:** Your Zitadel application must be configured with the
  correct redirect URI matching `redirect_uri` (e.g. `[origin]/auth/callback`)
  and post-logout redirect URI matching `post_logout_redirect_uri`.
- **URL Cleanup:** Provide an `onSigninCallback` handler that removes the
  authorization `code` and `state` parameters from the URL after the redirect,
  otherwise silent renewal may misbehave.
- **No Client Secret:** PKCE public clients must never be configured with a
  client secret; do not ship one in browser-exposed environment variables.

## Useful links

- **[oidc-client-ts](https://github.com/authts/oidc-client-ts):** The
  underlying OIDC client this integration builds on.
- **[Vue](https://vuejs.org/):** The framework this integration targets.

## Contributing

If you have suggestions for how this integration could be improved, or
want to report a bug, open an issue — we'd love all and any contributions.

## License

Apache-2.0
