import { defineComponent, h, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useAuth } from '../useAuth.js';

/**
 * Session-storage key under which the post-login return path is stored before
 * a signin redirect, and read back here after the callback completes.
 *
 * @example
 * ```ts
 * import { RETURN_TO_KEY } from '@zitadel/vue-auth/components';
 *
 * window.sessionStorage.setItem(RETURN_TO_KEY, '/dashboard');
 * ```
 *
 * @public
 */
export const RETURN_TO_KEY = 'zitadel:vue-auth:returnTo';

/**
 * Handles the OIDC signin callback. Mount this at the route matching your
 * `redirect_uri` (e.g. `/auth/callback`). The `AuthProvider` performs
 * the code exchange automatically; this component waits for it to resolve,
 * then navigates to the stored return path (or `/`), or to `/auth/error` on
 * failure.
 *
 * @example
 * ```ts
 * import { h } from 'vue';
 * import { SignInCallback } from '@zitadel/vue-auth/components';
 *
 * const route = { path: '/auth/callback', component: SignInCallback };
 * void h(SignInCallback);
 * ```
 *
 * @public
 */
export const SignInCallback = defineComponent({
  name: 'SignInCallback',
  setup() {
    const auth = useAuth();
    const router = useRouter();

    watch(
      () =>
        [
          auth.value.isLoading,
          auth.value.isAuthenticated,
          auth.value.error,
        ] as const,
      () => {
        if (auth.value.isLoading) {
          return;
        }
        if (auth.value.error) {
          void router.replace('/auth/error');
          return;
        }
        if (auth.value.isAuthenticated) {
          const returnTo = window.sessionStorage.getItem(RETURN_TO_KEY) ?? '/';
          window.sessionStorage.removeItem(RETURN_TO_KEY);
          void router.replace(returnTo);
        }
      },
      { immediate: true },
    );

    return () => h('p', 'Signing you in…');
  },
});
