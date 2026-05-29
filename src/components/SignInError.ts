import { defineComponent, h } from 'vue';
import { RouterLink } from 'vue-router';

import { useAuth } from '../useAuth.js';

/**
 * Displays the most recent authentication error. Mount this at a route such
 * as `/auth/error`; {@link SignInCallback} navigates here when the code
 * exchange fails.
 *
 * @example
 * ```ts
 * import { h } from 'vue';
 * import { SignInError } from '@zitadel/vue-auth/components';
 *
 * const route = { path: '/auth/error', component: SignInError };
 * void h(SignInError);
 * ```
 *
 * @public
 */
export const SignInError = defineComponent({
  name: 'SignInError',
  setup() {
    const auth = useAuth();

    return () =>
      h('section', [
        h('h1', 'Sign-in failed'),
        auth.value.error
          ? h('pre', [
              h(
                'code',
                `${auth.value.error.source}: ${auth.value.error.message}`,
              ),
            ])
          : h('p', 'An unknown error occurred.'),
        h('p', [
          h(RouterLink, { to: '/auth/signin' }, () => 'Back to sign in'),
        ]),
      ]);
  },
});
