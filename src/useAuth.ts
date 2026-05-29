import { inject, type Ref } from 'vue';

import { AuthContextKey, type AuthContextProps } from './AuthContext.js';

/**
 * Returns a reactive {@link Ref} of the current authentication state merged
 * with the `UserManager` navigation/lifecycle methods. Must be called from
 * within a component tree wrapped by {@link AuthProvider}.
 *
 * @returns A reactive ref of the auth state merged with the auth methods.
 *
 * @example
 * ```ts
 * import { useAuth } from '@zitadel/vue-auth';
 *
 * const auth = useAuth();
 * const login = (): void => void auth.value.signinRedirect();
 * const logout = (): void => void auth.value.signoutRedirect();
 * ```
 *
 * @public
 */
export const useAuth = (): Ref<AuthContextProps> => {
  const context = inject<Ref<AuthContextProps> | undefined>(
    AuthContextKey,
    undefined,
  );

  if (!context) {
    const message =
      'AuthProvider context is undefined, please verify you are calling useAuth() as child of a <AuthProvider> component.';
    console.warn(message);
    throw new Error(message);
  }

  return context;
};
