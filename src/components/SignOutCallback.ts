import { defineComponent, h, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useAuth } from '../useAuth.js';

/**
 * Handles the post-logout redirect. Mount this at the route matching your
 * `post_logout_redirect_uri` (e.g. `/auth/logout/callback`). Once the auth
 * state has settled, it navigates back to the application root.
 *
 * @example
 * ```ts
 * import { h } from 'vue';
 * import { SignOutCallback } from '@zitadel/vue-auth/components';
 *
 * const route = { path: '/auth/logout/callback', component: SignOutCallback };
 * void h(SignOutCallback);
 * ```
 *
 * @public
 */
export const SignOutCallback = defineComponent({
  name: 'SignOutCallback',
  setup() {
    const auth = useAuth();
    const router = useRouter();

    watch(
      () => auth.value.isLoading,
      () => {
        if (!auth.value.isLoading) {
          void router.replace('/');
        }
      },
      { immediate: true },
    );

    return () => h('p', 'Signing you out…');
  },
});
