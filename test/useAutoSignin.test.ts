import { describe, expect, it, jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { defineComponent, h, provide, ref, type Ref } from 'vue';

import { AuthContextKey, type AuthContextProps } from '../src/AuthContext.js';
import {
  useAutoSignin,
  type UseAutoSigninOptions,
} from '../src/useAutoSignin.js';
import { flushPromises } from './helpers.js';

/**
 * Builds a stub auth context ref with sensible defaults and spy navigators,
 * so the composable can be exercised without a real provider.
 */
const makeAuthRef = (
  overrides: Partial<AuthContextProps> = {},
): Ref<AuthContextProps> => {
  const ctx = {
    isLoading: false,
    isAuthenticated: false,
    activeNavigator: undefined,
    user: undefined,
    error: undefined,
    signinRedirect: jest.fn(async () => undefined),
    signinPopup: jest.fn(async () => undefined),
    ...overrides,
  } as unknown as AuthContextProps;
  return ref(ctx) as Ref<AuthContextProps>;
};

/**
 * Mounts a component that provides the given auth ref and calls
 * {@link useAutoSignin} with the supplied options.
 */
const mountAutoSignin = (
  authRef: Ref<AuthContextProps>,
  options?: UseAutoSigninOptions,
): ReturnType<typeof mount> => {
  const Host = defineComponent({
    setup() {
      provide(AuthContextKey, authRef);
      const Child = defineComponent({
        setup() {
          useAutoSignin(options);
          return () => h('div');
        },
      });
      return () => h(Child);
    },
  });
  return mount(Host);
};

/**
 * Mounts a component that calls {@link useAutoSignin} and exposes the returned
 * reactive status so tests can read it.
 */
const mountAutoSigninStatus = (
  authRef: Ref<AuthContextProps>,
  options?: UseAutoSigninOptions,
): { status: ReturnType<typeof useAutoSignin> } => {
  const captured: { status?: ReturnType<typeof useAutoSignin> } = {};
  const Host = defineComponent({
    setup() {
      provide(AuthContextKey, authRef);
      const Child = defineComponent({
        setup() {
          captured.status = useAutoSignin(options);
          return () => h('div');
        },
      });
      return () => h(Child);
    },
  });
  mount(Host);
  return { status: captured.status as ReturnType<typeof useAutoSignin> };
};

describe('useAutoSignin', () => {
  it('should expose the current authentication status', async () => {
    const authRef = makeAuthRef({ isAuthenticated: true });
    const { status } = mountAutoSigninStatus(authRef);

    await flushPromises();
    expect(status.value.isAuthenticated).toBe(true);
    expect(status.value.isLoading).toBe(false);
    expect(status.value.error).toBeUndefined();
  });

  it('should auto sign in using default signinRedirect', async () => {
    const authRef = makeAuthRef();
    mountAutoSignin(authRef);

    await flushPromises();
    expect(authRef.value.signinRedirect).toHaveBeenCalled();
  });

  it('should auto sign in using provided method signinRedirect', async () => {
    const authRef = makeAuthRef();
    mountAutoSignin(authRef, { signinMethod: 'signinRedirect' });

    await flushPromises();
    expect(authRef.value.signinRedirect).toHaveBeenCalled();
  });

  it('should auto sign in using provided method signinPopup', async () => {
    const authRef = makeAuthRef();
    mountAutoSignin(authRef, { signinMethod: 'signinPopup' });

    await flushPromises();
    expect(authRef.value.signinPopup).toHaveBeenCalled();
  });

  it('should auto sign and not call signinRedirect if other method provided', async () => {
    const authRef = makeAuthRef();
    mountAutoSignin(authRef, { signinMethod: 'signinPopup' });

    await flushPromises();
    expect(authRef.value.signinRedirect).not.toHaveBeenCalled();
    expect(authRef.value.signinPopup).toHaveBeenCalled();
  });

  it('should pass signinArgs to signinRedirect when provided', async () => {
    const authRef = makeAuthRef();
    const signinArgs = { login_hint: 'a@b.c' };
    mountAutoSignin(authRef, { signinMethod: 'signinRedirect', signinArgs });

    await flushPromises();
    expect(authRef.value.signinRedirect).toHaveBeenCalledWith(signinArgs);
  });

  it('should pass signinArgs to signinPopup when provided', async () => {
    const authRef = makeAuthRef();
    const signinArgs = { login_hint: 'a@b.c' };
    mountAutoSignin(authRef, { signinMethod: 'signinPopup', signinArgs });

    await flushPromises();
    expect(authRef.value.signinPopup).toHaveBeenCalledWith(signinArgs);
  });

  it('should pass signinArgs to signinRedirect when using default method', async () => {
    const authRef = makeAuthRef();
    const signinArgs = { login_hint: 'a@b.c' };
    mountAutoSignin(authRef, { signinArgs });

    await flushPromises();
    expect(authRef.value.signinRedirect).toHaveBeenCalledWith(signinArgs);
  });

  it('should call signinRedirect without signinArgs when no signinArgs provided', async () => {
    const authRef = makeAuthRef();
    mountAutoSignin(authRef, { signinMethod: 'signinRedirect' });

    await flushPromises();
    expect(authRef.value.signinRedirect).toHaveBeenCalledWith(undefined);
  });

  it('should call signinPopup without signinArgs when no signinArgs provided', async () => {
    const authRef = makeAuthRef();
    mountAutoSignin(authRef, { signinMethod: 'signinPopup' });

    await flushPromises();
    expect(authRef.value.signinPopup).toHaveBeenCalledWith(undefined);
  });

  it('should not trigger a signin when already authenticated', async () => {
    const authRef = makeAuthRef({ isAuthenticated: true });
    mountAutoSignin(authRef);

    await flushPromises();
    expect(authRef.value.signinRedirect).not.toHaveBeenCalled();
  });

  it('should not trigger a signin while loading', async () => {
    const authRef = makeAuthRef({ isLoading: true });
    mountAutoSignin(authRef);

    await flushPromises();
    expect(authRef.value.signinRedirect).not.toHaveBeenCalled();
  });

  it('should not trigger a signin when a navigator is active', async () => {
    const authRef = makeAuthRef({ activeNavigator: 'signinRedirect' });
    mountAutoSignin(authRef);

    await flushPromises();
    expect(authRef.value.signinRedirect).not.toHaveBeenCalled();
  });

  it('should not trigger a signin when the URL has auth params', async () => {
    window.history.pushState({}, '', '/?code=abc&state=xyz');
    try {
      const authRef = makeAuthRef();
      mountAutoSignin(authRef);

      await flushPromises();
      expect(authRef.value.signinRedirect).not.toHaveBeenCalled();
    } finally {
      window.history.pushState({}, '', '/');
    }
  });

  it('should only trigger a signin once', async () => {
    const authRef = makeAuthRef();
    mountAutoSignin(authRef);

    await flushPromises();
    // Toggle an unrelated reactive field to re-run the watchEffect.
    authRef.value = { ...authRef.value, isLoading: false };
    await flushPromises();
    expect(authRef.value.signinRedirect).toHaveBeenCalledTimes(1);
  });
});
