import { defineComponent, h } from 'vue';
import { RouterLink } from 'vue-router';

import { useAuth } from '../useAuth.js';

/**
 * Displays the authenticated user's profile and a sign-out action. Intended
 * to be mounted behind `withAuthenticationRequired` at a route such as
 * `/auth/account`.
 *
 * @example
 * ```ts
 * import { h } from 'vue';
 * import { Account } from '@zitadel/vue-auth/components';
 *
 * const route = { path: '/auth/account', component: Account };
 * void h(Account);
 * ```
 *
 * @public
 */
export const Account = defineComponent({
  name: 'Account',
  setup() {
    const auth = useAuth();

    return () => {
      if (!auth.value.isAuthenticated) {
        return h('p', [
          'You are not authenticated. Please ',
          h(RouterLink, { to: '/auth/signin' }, () => 'sign in'),
          '.',
        ]);
      }

      return h('section', [
        h('h1', 'Account'),
        h('dl', [
          h('dt', 'Subject'),
          h('dd', auth.value.user?.profile.sub),
          h('dt', 'Name'),
          h('dd', auth.value.user?.profile.name ?? '—'),
          h('dt', 'Email'),
          h('dd', auth.value.user?.profile.email ?? '—'),
        ]),
        h('pre', [
          h('code', JSON.stringify(auth.value.user?.profile, null, 2)),
        ]),
        h(
          'button',
          { onClick: () => void auth.value.signoutRedirect() },
          'Sign out',
        ),
      ]);
    };
  },
});
