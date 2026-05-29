import type {
  QuerySessionStatusArgs,
  RevokeTokensTypes,
  SessionStatus,
  SigninPopupArgs,
  SigninRedirectArgs,
  SigninResourceOwnerCredentialsArgs,
  SigninSilentArgs,
  SignoutPopupArgs,
  SignoutRedirectArgs,
  SignoutSilentArgs,
  User,
  UserManagerEvents,
  UserManagerSettings,
} from 'oidc-client-ts';
import type { InjectionKey, Ref } from 'vue';

import type { AuthState } from './AuthState.js';

/**
 * The value provided by {@link AuthProvider} and returned by
 * {@link useAuth}: the {@link AuthState} merged with the `UserManager`
 * navigation and lifecycle methods.
 *
 * @example
 * ```ts
 * import type { AuthContextProps } from '@zitadel/vue-auth';
 *
 * function logout(auth: AuthContextProps): void {
 *   void auth.signoutRedirect();
 * }
 * ```
 *
 * @public
 */
export interface AuthContextProps extends AuthState {
  /**
   * The resolved `UserManager` settings. See
   * {@link https://github.com/authts/oidc-client-ts | oidc-client-ts}.
   */
  readonly settings: UserManagerSettings;
  /**
   * The `UserManager` event emitter, for subscribing to token lifecycle
   * events such as access-token-expiring.
   */
  readonly events: UserManagerEvents;
  clearStaleState(): Promise<void>;
  removeUser(): Promise<void>;
  signinPopup(args?: SigninPopupArgs): Promise<User>;
  signinSilent(args?: SigninSilentArgs): Promise<User | null>;
  signinRedirect(args?: SigninRedirectArgs): Promise<void>;
  signinResourceOwnerCredentials(
    args: SigninResourceOwnerCredentialsArgs,
  ): Promise<User>;
  signoutRedirect(args?: SignoutRedirectArgs): Promise<void>;
  signoutPopup(args?: SignoutPopupArgs): Promise<void>;
  signoutSilent(args?: SignoutSilentArgs): Promise<void>;
  querySessionStatus(
    args?: QuerySessionStatusArgs,
  ): Promise<SessionStatus | null>;
  revokeTokens(types?: RevokeTokensTypes): Promise<void>;
  startSilentRenew(): void;
  stopSilentRenew(): void;
  hasRole(role: string): boolean;
}

/**
 * The injection key under which {@link AuthProvider} provides a reactive
 * {@link Ref} of the {@link AuthContextProps}. Prefer the {@link useAuth}
 * composable over injecting this directly.
 *
 * @example
 * ```ts
 * import { inject } from 'vue';
 * import { AuthContextKey } from '@zitadel/vue-auth';
 *
 * const auth = inject(AuthContextKey);
 * ```
 *
 * @public
 */
export const AuthContextKey: InjectionKey<Ref<AuthContextProps>> =
  Symbol('AuthContext');
