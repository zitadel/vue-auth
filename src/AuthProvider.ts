import {
  User,
  UserManager,
  type ProcessResourceOwnerPasswordCredentialsArgs,
  type SignoutResponse,
  type UserManagerSettings,
} from 'oidc-client-ts';
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  provide,
  type PropType,
  type Ref,
} from 'vue';

import { AuthContextKey, type AuthContextProps } from './AuthContext.js';
import { type ErrorContext, initialAuthState } from './AuthState.js';
import { applyOidcConfigDefaults, type ZitadelScopeConfig } from './config.js';
import { hasRole } from './hasRole.js';
import { reducer, useReducer } from './reducer.js';
import {
  hasAuthParams,
  normalizeError,
  renewSilentError,
  signinError,
  signoutError,
} from './utils.js';

/**
 * Properties common to every {@link AuthProvider} configuration.
 *
 * @example
 * ```ts
 * import type { AuthProviderBaseProps } from '@zitadel/vue-auth';
 *
 * const hooks: AuthProviderBaseProps = {
 *   onSigninCallback: () =>
 *     window.history.replaceState({}, document.title, window.location.pathname),
 * };
 * ```
 *
 * @public
 */
export interface AuthProviderBaseProps {
  /**
   * Hook invoked after a successful signin callback. Use it to remove the
   * `code` and `state` parameters from the URL after returning from the
   * authorize endpoint.
   */
  onSigninCallback?: (user: User | undefined) => Promise<void> | void;

  /**
   * By default, when the URL carries `code`/`state` params this provider
   * calls `userManager.signinCallback()` automatically. Set this to `true`
   * when those params belong to a different OAuth SDK.
   */
  skipSigninCallback?: boolean;

  /**
   * Predicate matched against the `UserManager` settings to detect a return
   * from the logout redirect (e.g. comparing against
   * `post_logout_redirect_uri`). When it matches, the provider calls
   * `userManager.signoutCallback()` automatically.
   */
  matchSignoutCallback?: (args: UserManagerSettings) => boolean;

  /**
   * Hook invoked after a successful signout callback. Requires
   * {@link AuthProviderBaseProps.matchSignoutCallback} to be set.
   */
  onSignoutCallback?: (
    resp: SignoutResponse | undefined,
  ) => Promise<void> | void;

  /**
   * Hook invoked after the user is removed via `removeUser()`.
   */
  onRemoveUser?: () => Promise<void> | void;
}

/**
 * The full prop surface of {@link AuthProvider}: the base hooks plus either
 * inline `UserManagerSettings` or a pre-constructed `userManager` instance.
 *
 * @example
 * ```ts
 * import type { AuthProviderProps } from '@zitadel/vue-auth';
 *
 * const props: AuthProviderProps = {
 *   authority: 'https://example.zitadel.cloud',
 *   client_id: 'client',
 *   redirect_uri: 'https://app.example.com/auth/callback',
 * };
 * ```
 *
 * @public
 */
export type AuthProviderProps = AuthProviderBaseProps &
  Partial<UserManagerSettings> &
  ZitadelScopeConfig & {
    /**
     * A custom `UserManager` instance. When provided, inline settings are
     * ignored.
     */
    userManager?: UserManager;
  };

const userManagerContextKeys = [
  'clearStaleState',
  'querySessionStatus',
  'revokeTokens',
  'startSilentRenew',
  'stopSilentRenew',
] as const;
const navigatorKeys = [
  'signinPopup',
  'signinSilent',
  'signinRedirect',
  'signinResourceOwnerCredentials',
  'signoutPopup',
  'signoutRedirect',
  'signoutSilent',
] as const;
const unsupportedEnvironment = (fnName: string) => () => {
  throw new Error(
    `UserManager#${fnName} was called from an unsupported context. If this is a server-rendered page, defer this call with onMounted() or pass a custom UserManager implementation.`,
  );
};
const UserManagerImpl = typeof window === 'undefined' ? null : UserManager;

/**
 * Provides the authentication context to its child components via Vue's
 * `provide`/`inject`. A reactive {@link Ref} of the auth context is provided
 * under {@link AuthContextKey} and consumed with {@link useAuth}.
 *
 * @example
 * ```ts
 * import { createApp, h } from 'vue';
 * import { AuthProvider } from '@zitadel/vue-auth';
 * import App from './App.js';
 *
 * createApp({
 *   render: () =>
 *     h(
 *       AuthProvider,
 *       {
 *         authority: import.meta.env.VITE_ZITADEL_DOMAIN,
 *         client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
 *         redirect_uri: import.meta.env.VITE_ZITADEL_CALLBACK_URL,
 *       },
 *       () => h(App),
 *     ),
 * }).mount('#app');
 * ```
 *
 * @public
 */
export const AuthProvider = defineComponent({
  name: 'AuthProvider',
  props: {
    onSigninCallback: {
      type: Function as PropType<AuthProviderProps['onSigninCallback']>,
      default: undefined,
    },
    skipSigninCallback: {
      type: Boolean,
      default: undefined,
    },
    matchSignoutCallback: {
      type: Function as PropType<AuthProviderProps['matchSignoutCallback']>,
      default: undefined,
    },
    onSignoutCallback: {
      type: Function as PropType<AuthProviderProps['onSignoutCallback']>,
      default: undefined,
    },
    onRemoveUser: {
      type: Function as PropType<AuthProviderProps['onRemoveUser']>,
      default: undefined,
    },
    userManager: {
      type: Object as PropType<UserManager>,
      default: undefined,
    },
    settings: {
      type: Object as PropType<Partial<UserManagerSettings>>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const {
      onSigninCallback,
      skipSigninCallback,
      matchSignoutCallback,
      onSignoutCallback,
      onRemoveUser,
      userManager: userManagerProp,
    } = props;

    // Any inline UserManagerSettings are passed via attrs (fall-through) or
    // the explicit `settings` prop.
    const userManagerSettings = applyOidcConfigDefaults({
      ...(attrs as Partial<UserManagerSettings & ZitadelScopeConfig>),
      ...(props.settings ?? {}),
    } as UserManagerSettings & ZitadelScopeConfig);

    const userManager: UserManager =
      userManagerProp ??
      (UserManagerImpl
        ? new UserManagerImpl(userManagerSettings)
        : ({ settings: userManagerSettings } as UserManager));

    const { state, dispatch } = useReducer(reducer, initialAuthState);

    const userManagerContext = Object.assign(
      {
        settings: userManager.settings,
        events: userManager.events,
      },
      Object.fromEntries(
        userManagerContextKeys.map((key) => [
          key,
          userManager[key]?.bind(userManager) ?? unsupportedEnvironment(key),
        ]),
      ) as Pick<UserManager, (typeof userManagerContextKeys)[number]>,
      Object.fromEntries(
        navigatorKeys.map((key) => [
          key,
          userManager[key]
            ? async (
                args: ProcessResourceOwnerPasswordCredentialsArgs & never[],
              ) => {
                dispatch({
                  type: 'NAVIGATOR_INIT',
                  method: key,
                });
                try {
                  return await userManager[key](args);
                } catch (error) {
                  dispatch({
                    type: 'ERROR',
                    error: {
                      ...normalizeError(
                        error,
                        `Unknown error while executing ${key}(...).`,
                      ),
                      source: key,
                      args,
                    } as ErrorContext,
                  });
                  return null;
                } finally {
                  dispatch({ type: 'NAVIGATOR_CLOSE' });
                }
              }
            : unsupportedEnvironment(key),
        ]),
      ) as Pick<UserManager, (typeof navigatorKeys)[number]>,
    );

    const removeUser = async (): Promise<void> => {
      await userManager.removeUser();
      if (onRemoveUser) {
        await onRemoveUser();
      }
    };

    let didInitialize = false;

    onMounted(() => {
      if (didInitialize) {
        return;
      }
      didInitialize = true;

      void (async (): Promise<void> => {
        // sign-in
        try {
          let user: User | undefined | null = null;

          // check if returning back from authority server
          if (hasAuthParams() && !skipSigninCallback) {
            user = await userManager.signinCallback();
            if (onSigninCallback) {
              await onSigninCallback(user ?? undefined);
            }
          }
          user = !user ? await userManager.getUser() : user;
          dispatch({ type: 'INITIALISED', user });
        } catch (error) {
          dispatch({
            type: 'ERROR',
            error: signinError(error),
          });
        }

        // sign-out
        try {
          if (
            matchSignoutCallback &&
            matchSignoutCallback(userManager.settings)
          ) {
            const resp = await userManager.signoutCallback();
            if (onSignoutCallback) {
              await onSignoutCallback(resp ?? undefined);
            }
          }
        } catch (error) {
          dispatch({
            type: 'ERROR',
            error: signoutError(error),
          });
        }
      })();
    });

    // register to userManager events
    const handleUserLoaded = (user: User): void => {
      dispatch({ type: 'USER_LOADED', user });
    };
    const handleUserUnloaded = (): void => {
      dispatch({ type: 'USER_UNLOADED' });
    };
    const handleUserSignedOut = (): void => {
      dispatch({ type: 'USER_SIGNED_OUT' });
    };
    const handleSilentRenewError = (error: Error): void => {
      dispatch({
        type: 'ERROR',
        error: renewSilentError(error),
      });
    };

    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addUserSignedOut(handleUserSignedOut);
    userManager.events.addSilentRenewError(handleSilentRenewError);

    onBeforeUnmount(() => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeUserSignedOut(handleUserSignedOut);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
    });

    const contextValue: Ref<AuthContextProps> = computed(
      () =>
        ({
          ...state.value,
          ...userManagerContext,
          removeUser,
          hasRole: (role: string): boolean => hasRole(state.value.user, role),
        }) as AuthContextProps,
    );

    provide(AuthContextKey, contextValue);

    return () => slots.default?.();
  },
});
