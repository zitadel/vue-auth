---
title: Router Guard
group: Vue
---

# Router guard

`createAuthGuard()` returns a `vue-router` navigation guard. It inspects
each navigation target: routes without `meta.requiresAuth` pass straight
through, and routes that require authentication either proceed (when the
user is authenticated) or trigger a sign-in redirect and cancel the
navigation.

## Wiring it globally

Register the guard once with `router.beforeEach`:

```ts
import { createRouter, createWebHistory } from 'vue-router';
import { createAuthGuard, zitadelRoutes } from '@zitadel/vue-auth/routes';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    ...zitadelRoutes,
  ],
});

router.beforeEach(createAuthGuard());
```

## Marking routes

A route is protected by setting `meta.requiresAuth` to `true`:

```ts
{ path: '/profile', component: Profile, meta: { requiresAuth: true } }
```

The bundled `/auth/account` route already carries this flag, so the guard
protects it for you.

## How it behaves

- If the route does not require auth, navigation continues.
- If the user is authenticated, navigation continues.
- If the URL carries an in-flight authorization response, the auth state
  is still loading, or a navigator is active, the navigation is held.
- Otherwise the guard calls `signinRedirect()` and cancels the
  navigation; the user returns to the app authenticated.
