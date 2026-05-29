import { defineComponent, h, type PropType } from 'vue';

import { useAuth } from '../useAuth.js';
import { RETURN_TO_KEY } from './SignInCallback.js';

/**
 * Props for {@link SignIn}.
 *
 * @example
 * ```ts
 * import type { SignInProps } from '@zitadel/vue-auth/components';
 *
 * const props: SignInProps = { returnTo: '/dashboard' };
 * ```
 *
 * @public
 */
export interface SignInProps {
  /**
   * Where to navigate after a successful sign-in. Persisted to session
   * storage and read back by {@link SignInCallback}. Defaults to `/`.
   */
  returnTo?: string;
}

/**
 * A sign-in method picker offering redirect, popup, and silent flows, plus a
 * sign-out action when already authenticated. Mount this at a route such as
 * `/auth/signin`.
 *
 * @example
 * ```ts
 * import { h } from 'vue';
 * import { SignIn } from '@zitadel/vue-auth/components';
 *
 * const route = { path: '/auth/signin', component: SignIn };
 * void h(SignIn, { returnTo: '/dashboard' });
 * ```
 *
 * @public
 */
export const SignIn = defineComponent({
  name: 'SignIn',
  props: {
    returnTo: {
      type: String as PropType<SignInProps['returnTo']>,
      default: undefined,
    },
  },
  setup(props) {
    const auth = useAuth();

    const rememberReturn = (): void => {
      if (props.returnTo) {
        window.sessionStorage.setItem(RETURN_TO_KEY, props.returnTo);
      }
    };

    return () => {
      if (auth.value.isAuthenticated) {
        return h('section', [
          h('p', `You are signed in as ${auth.value.user?.profile.sub}.`),
          h(
            'button',
            { onClick: () => void auth.value.signoutRedirect() },
            'Sign out',
          ),
        ]);
      }

      return h('section', [
        h('h1', 'Sign in'),
        h(
          'button',
          {
            onClick: () => {
              rememberReturn();
              void auth.value.signinRedirect();
            },
          },
          'Sign in with redirect',
        ),
        h(
          'button',
          {
            onClick: () => {
              rememberReturn();
              void auth.value.signinPopup();
            },
          },
          'Sign in with popup',
        ),
        h(
          'button',
          { onClick: () => void auth.value.signinSilent() },
          'Sign in silently',
        ),
      ]);
    };
  },
});
