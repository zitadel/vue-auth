import { jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import type { User, UserManager } from 'oidc-client-ts';
import { defineComponent, h, type Component, type Ref } from 'vue';

import { AuthProvider, type AuthProviderProps } from '../src/AuthProvider.js';
import type { AuthContextProps } from '../src/AuthContext.js';
import { useAuth } from '../src/useAuth.js';

/**
 * Builds a stub `UserManager` good enough to drive the provider in tests,
 * without contacting a real identity provider. Override any method via
 * `overrides`.
 */
export const createFakeUserManager = (
  overrides: Partial<Record<keyof UserManager, unknown>> = {},
): UserManager => {
  const noop = jest.fn();
  const events = {
    addUserLoaded: noop,
    removeUserLoaded: noop,
    addUserUnloaded: noop,
    removeUserUnloaded: noop,
    addUserSignedOut: noop,
    removeUserSignedOut: noop,
    addSilentRenewError: noop,
    removeSilentRenewError: noop,
  };

  const manager = {
    settings: { authority: 'authority', client_id: 'client' },
    events,
    getUser: jest.fn(async () => null),
    signinCallback: jest.fn(async () => undefined),
    signoutCallback: jest.fn(async () => undefined),
    removeUser: jest.fn(async () => undefined),
    signinRedirect: jest.fn(async () => undefined),
    signinPopup: jest.fn(async () => undefined as unknown as User),
    signinSilent: jest.fn(async () => null),
    signinResourceOwnerCredentials: jest.fn(async () => undefined),
    signoutRedirect: jest.fn(async () => undefined),
    signoutPopup: jest.fn(async () => undefined),
    signoutSilent: jest.fn(async () => undefined),
    clearStaleState: jest.fn(async () => undefined),
    querySessionStatus: jest.fn(async () => null),
    revokeTokens: jest.fn(async () => undefined),
    startSilentRenew: jest.fn(),
    stopSilentRenew: jest.fn(),
    ...overrides,
  };

  return manager as unknown as UserManager;
};

/**
 * Flushes pending microtasks so the provider's async `onMounted` work settles
 * before assertions run.
 */
export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mounts the default-exported {@link AuthProvider} configured with the given
 * props and renders the supplied child inside it. Returns the mounted wrapper
 * so tests can inspect the rendered DOM. Mirrors react-auth's `createWrapper`.
 */
export const createWrapper = (
  opts: AuthProviderProps,
  child: Component = defineComponent({ setup: () => () => h('div') }),
): ReturnType<typeof mount> =>
  mount(AuthProvider, {
    props: opts as Record<string, unknown>,
    slots: { default: () => h(child) },
  });

/**
 * Mounts the provider with a child that captures the injected auth ref so
 * tests can assert against it. Because Vue's {@link useAuth} returns a
 * {@link Ref}, assert via `auth.value`.
 */
export const mountWithAuth = (
  opts: AuthProviderProps,
): { auth: Ref<AuthContextProps>; wrapper: ReturnType<typeof mount> } => {
  const captured: { auth?: Ref<AuthContextProps> } = {};
  const Child = defineComponent({
    setup() {
      captured.auth = useAuth();
      return () => h('div');
    },
  });
  const wrapper = mount(AuthProvider, {
    props: opts as Record<string, unknown>,
    slots: { default: () => h(Child) },
  });
  return { auth: captured.auth as Ref<AuthContextProps>, wrapper };
};
