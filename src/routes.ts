import type { NavigationGuardWithThis, RouteRecordRaw } from 'vue-router';

import { useAuth } from './useAuth.js';
import { hasAuthParams } from './utils.js';
import {
  Account,
  SignIn,
  SignInCallback,
  SignInError,
  SignOutCallback,
} from './components/index.js';

/**
 * Creates a `vue-router` navigation guard that protects routes behind
 * authentication. When an anonymous user navigates to a guarded route, the
 * guard triggers a signin redirect and cancels the navigation. Attach it
 * either globally (`router.beforeEach`) or per-route via `beforeEnter`.
 *
 * @returns A navigation guard.
 *
 * @example
 * ```ts
 * import { createRouter, createWebHistory } from 'vue-router';
 * import { createAuthGuard, zitadelRoutes } from '@zitadel/vue-auth/routes';
 *
 * const router = createRouter({
 *   history: createWebHistory(),
 *   routes: zitadelRoutes,
 * });
 * router.beforeEach(createAuthGuard());
 * ```
 *
 * @public
 */
export const createAuthGuard = (): NavigationGuardWithThis<undefined> => {
  return (to) => {
    if (!to.meta?.requiresAuth) {
      return true;
    }
    const auth = useAuth();
    if (auth.value.isAuthenticated) {
      return true;
    }
    if (hasAuthParams() || auth.value.isLoading || auth.value.activeNavigator) {
      return false;
    }
    void auth.value.signinRedirect();
    return false;
  };
};

/**
 * A ready-made `vue-router` route bundle wiring the bundled components under
 * the `/auth` prefix:
 *
 * - `/auth/signin` &rarr; {@link SignIn}
 * - `/auth/callback` &rarr; {@link SignInCallback} (your `redirect_uri`)
 * - `/auth/error` &rarr; {@link SignInError}
 * - `/auth/logout/callback` &rarr; {@link SignOutCallback}
 *   (your `post_logout_redirect_uri`)
 * - `/auth/account` &rarr; {@link Account}, marked `requiresAuth` so a guard
 *   created with {@link createAuthGuard} protects it
 *
 * Spread it into your router alongside your own routes, and register
 * {@link createAuthGuard} to enforce the `requiresAuth` meta.
 *
 * @example
 * ```ts
 * import { createRouter, createWebHistory } from 'vue-router';
 * import { createAuthGuard, zitadelRoutes } from '@zitadel/vue-auth/routes';
 *
 * const router = createRouter({
 *   history: createWebHistory(),
 *   routes: [{ path: '/', component: Home }, ...zitadelRoutes],
 * });
 * router.beforeEach(createAuthGuard());
 * ```
 *
 * @public
 */
export const zitadelRoutes: RouteRecordRaw[] = [
  { path: '/auth/signin', component: SignIn },
  { path: '/auth/callback', component: SignInCallback },
  { path: '/auth/error', component: SignInError },
  { path: '/auth/logout/callback', component: SignOutCallback },
  { path: '/auth/account', component: Account, meta: { requiresAuth: true } },
];
