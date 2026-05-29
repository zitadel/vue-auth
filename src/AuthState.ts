import type {
  SigninPopupArgs,
  SigninRedirectArgs,
  SigninResourceOwnerCredentialsArgs,
  SigninSilentArgs,
  SignoutPopupArgs,
  SignoutRedirectArgs,
  SignoutSilentArgs,
  User,
} from 'oidc-client-ts';

/**
 * The authentication state which, combined with the auth methods, makes up
 * the return object of the {@link useAuth} composable.
 *
 * @example
 * ```ts
 * import type { AuthState } from '@zitadel/vue-auth';
 *
 * const initial: AuthState = { isLoading: true, isAuthenticated: false };
 * ```
 *
 * @public
 */
export interface AuthState {
  /**
   * The current user, or `null`/`undefined` when not authenticated. See
   * {@link https://authts.github.io/oidc-client-ts/classes/User.html | User}.
   */
  readonly user?: User | null;

  /**
   * True when the library has been initialized and no navigator request is
   * in progress.
   */
  readonly isLoading: boolean;

  /**
   * True while the user has a valid access token.
   */
  readonly isAuthenticated: boolean;

  /**
   * Tracks the status of the most recent signin/signout request method.
   */
  readonly activeNavigator?:
    | 'signinRedirect'
    | 'signinResourceOwnerCredentials'
    | 'signinPopup'
    | 'signinSilent'
    | 'signoutRedirect'
    | 'signoutPopup'
    | 'signoutSilent';

  /**
   * The most recent signin, signout, or silent-renew error, if any.
   */
  readonly error?: ErrorContext;
}

/**
 * Represents an error raised while executing a signin, signout, or silent
 * renew. The discriminating `source` field identifies the operation that
 * failed.
 *
 * @example
 * ```ts
 * import type { ErrorContext } from '@zitadel/vue-auth';
 *
 * function describe(error: ErrorContext): string {
 *   return `${error.source}: ${error.message}`;
 * }
 * ```
 *
 * @public
 */
export type ErrorContext = Error & {
  innerError?: unknown;
} & (
    | { source: 'signinCallback' }
    | { source: 'signoutCallback' }
    | { source: 'renewSilent' }
    | { source: 'signinPopup'; args: SigninPopupArgs | undefined }
    | { source: 'signinSilent'; args: SigninSilentArgs | undefined }
    | { source: 'signinRedirect'; args: SigninRedirectArgs | undefined }
    | {
        source: 'signinResourceOwnerCredentials';
        args: SigninResourceOwnerCredentialsArgs | undefined;
      }
    | { source: 'signoutPopup'; args: SignoutPopupArgs | undefined }
    | { source: 'signoutRedirect'; args: SignoutRedirectArgs | undefined }
    | { source: 'signoutSilent'; args: SignoutSilentArgs | undefined }
    | { source: 'unknown' }
  );

/**
 * The initial authentication state, before the provider has initialized.
 */
export const initialAuthState = {
  isLoading: true,
  isAuthenticated: false,
} satisfies AuthState;
