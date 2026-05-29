import { computed, ref, watchEffect, type ComputedRef } from 'vue';
import type { SigninPopupArgs, SigninRedirectArgs } from 'oidc-client-ts';

import { useAuth } from './useAuth.js';
import { hasAuthParams } from './utils.js';
import type { AuthState } from './AuthState.js';

/**
 * Options for {@link useAutoSignin}.
 *
 * @public
 */
export interface UseAutoSigninOptions {
  /**
   * Which sign-in flow to use. Defaults to `'signinRedirect'`. The
   * `signinResourceOwnerCredentials` method is not supported.
   */
  signinMethod?: 'signinRedirect' | 'signinPopup';

  /**
   * Additional arguments forwarded to the chosen sign-in method.
   */
  signinArgs?: SigninRedirectArgs | SigninPopupArgs;
}

/**
 * Automatically attempts to sign in a user, once, when the app loads
 * unauthenticated. Uses the redirect flow by default.
 *
 * Does not support the `signinResourceOwnerCredentials` method.
 *
 * @param options - Optional configuration. Defaults to
 *   `{ signinMethod: 'signinRedirect' }`.
 * @returns A reactive view of the current authentication status.
 *
 * @example
 * ```ts
 * import { useAutoSignin } from '@zitadel/vue-auth';
 *
 * const status = useAutoSignin();
 * // status.value.isLoading, status.value.isAuthenticated, status.value.error
 * ```
 *
 * @public
 */
export function useAutoSignin(
  options: UseAutoSigninOptions = {},
): ComputedRef<Pick<AuthState, 'isAuthenticated' | 'isLoading' | 'error'>> {
  const { signinMethod = 'signinRedirect', signinArgs } = options;
  const auth = useAuth();
  const hasTriedSignin = ref(false);

  watchEffect(() => {
    const current = auth.value;
    if (
      hasAuthParams() ||
      current.isAuthenticated ||
      current.activeNavigator ||
      current.isLoading ||
      hasTriedSignin.value
    ) {
      return;
    }

    hasTriedSignin.value = true;
    switch (signinMethod) {
      case 'signinPopup':
        void current.signinPopup(signinArgs);
        break;
      case 'signinRedirect':
      default:
        void current.signinRedirect(signinArgs);
        break;
    }
  });

  return computed(() => ({
    isLoading: auth.value.isLoading,
    isAuthenticated: auth.value.isAuthenticated,
    error: auth.value.error,
  }));
}
