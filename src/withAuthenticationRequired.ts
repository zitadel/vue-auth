import type { SigninRedirectArgs } from 'oidc-client-ts';
import {
  defineAsyncComponent,
  defineComponent,
  h,
  watch,
  type Component,
  type VNode,
} from 'vue';

import { RETURN_TO_KEY } from './components/SignInCallback.js';
import { useAuth } from './useAuth.js';
import { hasAuthParams } from './utils.js';

/**
 * Options for {@link withAuthenticationRequired} and
 * {@link withAuthenticationRequiredAsync}.
 *
 * @example
 * ```ts
 * import { h } from 'vue';
 * import type { WithAuthenticationRequiredProps } from '@zitadel/vue-auth';
 *
 * const options: WithAuthenticationRequiredProps = {
 *   onRedirecting: h('div', 'Redirecting to login...'),
 * };
 * ```
 *
 * @public
 */
export interface WithAuthenticationRequiredProps {
  /**
   * Rendered while the user is being redirected to the signin page.
   */
  onRedirecting?: VNode;

  /**
   * Runs immediately before the signin redirect is triggered.
   */
  onBeforeSignin?: () => Promise<void> | void;

  /**
   * Additional arguments passed to `signinRedirect()`.
   */
  signinRedirectArgs?: SigninRedirectArgs;
}

/**
 * A higher-order component that guards content behind authentication. When an
 * anonymous user visits the wrapped component, they are redirected to the
 * signin page and returned afterwards.
 *
 * @param WrappedComponent - The component to protect.
 * @param options - Optional redirect behavior.
 * @returns The guarded component.
 *
 * @example
 * ```ts
 * import { h } from 'vue';
 * import { withAuthenticationRequired } from '@zitadel/vue-auth';
 * import ProfileView from './ProfileView.js';
 *
 * export default withAuthenticationRequired(ProfileView, {
 *   onRedirecting: h('div', 'Redirecting to login...'),
 * });
 * ```
 *
 * @public
 */
export const withAuthenticationRequired = (
  WrappedComponent: Component,
  options: WithAuthenticationRequiredProps = {},
): Component => {
  const {
    onBeforeSignin,
    signinRedirectArgs,
    onRedirecting = h('div'),
  } = options;

  return defineComponent({
    name: 'WithAuthenticationRequired',
    setup() {
      const auth = useAuth();

      watch(
        () => [auth.value.isLoading, auth.value.isAuthenticated] as const,
        () => {
          if (
            hasAuthParams() ||
            auth.value.isLoading ||
            auth.value.activeNavigator ||
            auth.value.isAuthenticated
          ) {
            return;
          }
          void (async (): Promise<void> => {
            if (onBeforeSignin) {
              await onBeforeSignin();
            }
            window.sessionStorage.setItem(
              RETURN_TO_KEY,
              window.location.pathname + window.location.search,
            );
            await auth.value.signinRedirect(signinRedirectArgs);
          })();
        },
        { immediate: true },
      );

      return () =>
        auth.value.isAuthenticated ? h(WrappedComponent) : onRedirecting;
    },
  });
};

/**
 * A higher-order component that guards a lazily-loaded component behind
 * authentication. When an anonymous user visits the wrapped component, they
 * are redirected to the signin page and returned afterwards. The protected
 * component is only imported once the user is authenticated.
 *
 * @param importComponent - A loader returning a module with a default export.
 * @param options - Optional redirect behavior.
 * @returns The guarded async component.
 *
 * @example
 * ```ts
 * import { withAuthenticationRequiredAsync } from '@zitadel/vue-auth';
 *
 * export default withAuthenticationRequiredAsync(
 *   () => import('./ProfileView.js'),
 * );
 * ```
 *
 * @public
 */
export const withAuthenticationRequiredAsync = (
  importComponent: () => Promise<{ default: Component }>,
  options: WithAuthenticationRequiredProps = {},
): Component => {
  const {
    onBeforeSignin,
    signinRedirectArgs,
    onRedirecting = h('div'),
  } = options;

  return defineAsyncComponent(
    () =>
      new Promise<Component>((resolve, reject) => {
        const auth = useAuth();

        watch(
          () => [auth.value.isLoading, auth.value.isAuthenticated] as const,
          () => {
            if (
              hasAuthParams() ||
              auth.value.isLoading ||
              auth.value.activeNavigator ||
              auth.value.isAuthenticated
            ) {
              return;
            }
            void (async (): Promise<void> => {
              if (onBeforeSignin) {
                await onBeforeSignin();
              }
              window.sessionStorage.setItem(
                RETURN_TO_KEY,
                window.location.pathname + window.location.search,
              );
              await auth.value.signinRedirect(signinRedirectArgs);
            })();
          },
          { immediate: true },
        );

        if (auth.value.isAuthenticated) {
          importComponent()
            .then((mod) => resolve(mod.default))
            .catch(reject);
        } else {
          resolve(
            defineComponent({
              name: 'AuthRedirecting',
              setup() {
                return () => onRedirecting;
              },
            }),
          );
        }
      }),
  );
};
