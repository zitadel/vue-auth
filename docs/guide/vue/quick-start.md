---
title: Quick Start
group: Vue
children:
  - ./components.md
  - ./router-guard.md
  - ./api-calls.md
---

# Vue Quick Start

This guide walks through wiring `@zitadel/vue-auth` into a Vue 3 SPA: an
`AuthProvider` at the root, the bundled `/auth` routes, a global router
guard, a protected page, and a sign-in button.

## Install

```bash
npm install @zitadel/vue-auth oidc-client-ts vue-router
```

## Wrap the app in `AuthProvider`

There is no plugin to register: `AuthProvider` is a component that
provides the auth context to everything it renders. Wrap your root `App`
in it and pass your configuration inline.

```ts
// src/main.ts
import { createApp, h } from 'vue';
import { AuthProvider } from '@zitadel/vue-auth';
import App from './App.vue';
import { router } from './router';

createApp({
  render: () =>
    h(
      AuthProvider,
      {
        authority: import.meta.env.VITE_ZITADEL_DOMAIN,
        client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
        redirect_uri: import.meta.env.VITE_ZITADEL_CALLBACK_URL,
        post_logout_redirect_uri: import.meta.env.VITE_ZITADEL_POST_LOGOUT_URL,
        onSigninCallback: () =>
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          ),
      },
      () => h(App),
    ),
})
  .use(router)
  .mount('#app');
```

## Set up the router

Spread `zitadelRoutes` into your own routes and register the guard. The
guard protects any route with `meta.requiresAuth`.

```ts
// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import { createAuthGuard, zitadelRoutes } from '@zitadel/vue-auth/routes';
import Home from './pages/Home.vue';
import Profile from './pages/Profile.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    ...zitadelRoutes,
  ],
});

router.beforeEach(createAuthGuard());
```

## Add a sign-in button

```vue
<!-- src/pages/Home.vue -->
<script setup lang="ts">
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();
</script>

<template>
  <p v-if="auth.isAuthenticated">Signed in as {{ auth.user?.profile.name }}</p>
  <button v-else @click="auth.signinRedirect()">Sign in</button>
</template>
```

## Read the session on a protected page

Because `/profile` carries `meta.requiresAuth`, the guard redirects
anonymous visitors to sign in. Once authenticated they reach the page:

```vue
<!-- src/pages/Profile.vue -->
<script setup lang="ts">
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();
</script>

<template>
  <pre>{{ auth.user?.profile }}</pre>
  <button @click="auth.signoutRedirect()">Sign out</button>
</template>
```

## Next Steps

- [Use the bundled components](./components.md)
- [Understand the router guard](./router-guard.md)
- [Call an API with the access token](./api-calls.md)
