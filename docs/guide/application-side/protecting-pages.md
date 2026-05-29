---
title: Protecting Pages
group: Application Side
---

# Protecting pages

There are three complementary ways to gate content behind authentication.
Pick whichever fits the shape of your app.

## Global router guard

`createAuthGuard()` returns a `vue-router` navigation guard. Register it
once with `router.beforeEach` and it protects every route whose
`meta.requiresAuth` is `true`. Anonymous users are redirected to sign in.

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

## Higher-order component guard

`withAuthenticationRequired` wraps a single component so anonymous users
are redirected to sign in before it renders:

```ts
import { h } from 'vue';
import { withAuthenticationRequired } from '@zitadel/vue-auth';
import ProfileView from './ProfileView.vue';

export default withAuthenticationRequired(ProfileView, {
  onRedirecting: h('div', 'Redirecting to login...'),
});
```

For a route component that should only be downloaded once the user is
authenticated, use the async variant:

```ts
import { withAuthenticationRequiredAsync } from '@zitadel/vue-auth';

export default withAuthenticationRequiredAsync(
  () => import('./ProfileView.vue'),
);
```

## Automatic sign-in on load

`useAutoSignin` triggers a single sign-in attempt when the app loads
unauthenticated. Use it when the whole application is private:

```ts
import { useAutoSignin } from '@zitadel/vue-auth';

const status = useAutoSignin();
// status.value.isLoading, status.value.isAuthenticated, status.value.error
```
