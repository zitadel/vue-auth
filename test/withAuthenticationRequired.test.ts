import { describe, expect, it, jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { defineComponent, h, provide, ref, type Ref } from 'vue';

import { AuthContextKey, type AuthContextProps } from '../src/AuthContext.js';
import {
  withAuthenticationRequired,
  withAuthenticationRequiredAsync,
} from '../src/withAuthenticationRequired.js';
import {
  createFakeUserManager,
  createWrapper,
  flushPromises,
} from './helpers.js';

const Secret = defineComponent({
  setup() {
    return () => h('div', 'secret');
  },
});

const makeAuthRef = (
  overrides: Partial<AuthContextProps> = {},
): Ref<AuthContextProps> => {
  const ctx = {
    isLoading: false,
    isAuthenticated: false,
    activeNavigator: undefined,
    signinRedirect: jest.fn(() => new Promise<void>(() => undefined)),
    ...overrides,
  } as unknown as AuthContextProps;
  return ref(ctx) as Ref<AuthContextProps>;
};

describe('withAuthenticationRequired', () => {
  it('should redirect to signin when the user is unauthenticated', async () => {
    // A real signin redirect navigates the browser away and never resolves
    // in-page, so model it with a never-settling promise.
    const signinRedirect = jest.fn(() => new Promise<void>(() => undefined));
    const userManager = createFakeUserManager({ signinRedirect });
    const Protected = withAuthenticationRequired(Secret);

    const wrapper = createWrapper({ userManager }, Protected);

    await flushPromises();
    expect(signinRedirect).toHaveBeenCalled();
    expect(wrapper.text()).not.toContain('secret');
  });

  it('should render the component when the user is authenticated', async () => {
    const userManager = createFakeUserManager({
      getUser: jest.fn(async () => ({
        expired: false,
        profile: { sub: 'user-1' },
      })),
    });
    const Protected = withAuthenticationRequired(Secret);

    const wrapper = createWrapper({ userManager }, Protected);

    await flushPromises();
    expect(wrapper.text()).toContain('secret');
  });

  it('should render the OnRedirecting fallback while redirecting', async () => {
    const signinRedirect = jest.fn(() => new Promise<void>(() => undefined));
    const userManager = createFakeUserManager({ signinRedirect });
    const Protected = withAuthenticationRequired(Secret, {
      onRedirecting: h('div', 'redirecting…'),
    });

    const wrapper = createWrapper({ userManager }, Protected);

    await flushPromises();
    expect(wrapper.text()).toContain('redirecting…');
    expect(wrapper.text()).not.toContain('secret');
  });

  it('should call onBeforeSignin before redirecting', async () => {
    const onBeforeSignin = jest.fn(async () => undefined);
    const authRef = makeAuthRef({ isAuthenticated: false });
    const Protected = withAuthenticationRequired(Secret, { onBeforeSignin });
    const Host = defineComponent({
      setup() {
        provide(AuthContextKey, authRef);
        return () => h(Protected);
      },
    });

    mount(Host);
    await flushPromises();
    expect(onBeforeSignin).toHaveBeenCalled();
    expect(authRef.value.signinRedirect).toHaveBeenCalled();
  });

  it('should skip redirecting while loading or with auth params', async () => {
    const authRef = makeAuthRef({ isLoading: true });
    const Protected = withAuthenticationRequired(Secret);
    const Host = defineComponent({
      setup() {
        provide(AuthContextKey, authRef);
        return () => h(Protected);
      },
    });

    mount(Host);
    await flushPromises();
    expect(authRef.value.signinRedirect).not.toHaveBeenCalled();
  });

  it('should store the return path before redirecting', async () => {
    window.history.pushState({}, '', '/protected?tab=1');
    window.sessionStorage.clear();
    try {
      const signinRedirect = jest.fn(() => new Promise<void>(() => undefined));
      const userManager = createFakeUserManager({ signinRedirect });
      const Protected = withAuthenticationRequired(Secret);

      createWrapper({ userManager }, Protected);

      await flushPromises();
      expect(signinRedirect).toHaveBeenCalled();
      expect(window.sessionStorage.getItem('zitadel:vue-auth:returnTo')).toBe(
        '/protected?tab=1',
      );
    } finally {
      window.history.pushState({}, '', '/');
      window.sessionStorage.clear();
    }
  });

  describe('withAuthenticationRequiredAsync', () => {
    it('should load the protected component when authenticated', async () => {
      const authRef = makeAuthRef({ isAuthenticated: true });
      const importComponent = jest.fn(async () => ({ default: Secret }));
      const Protected = withAuthenticationRequiredAsync(importComponent);
      const Host = defineComponent({
        setup() {
          provide(AuthContextKey, authRef);
          return () => h(Protected);
        },
      });

      const wrapper = mount(Host);

      await flushPromises();
      await flushPromises();
      expect(importComponent).toHaveBeenCalled();
      expect(wrapper.text()).toContain('secret');
    });

    it('should render the redirecting fallback when unauthenticated', async () => {
      const authRef = makeAuthRef({ isAuthenticated: false });
      const importComponent = jest.fn(async () => ({ default: Secret }));
      const Protected = withAuthenticationRequiredAsync(importComponent, {
        onRedirecting: h('div', 'redirecting…'),
      });
      const Host = defineComponent({
        setup() {
          provide(AuthContextKey, authRef);
          return () => h(Protected);
        },
      });

      const wrapper = mount(Host);

      await flushPromises();
      await flushPromises();
      expect(wrapper.text()).toContain('redirecting…');
      expect(importComponent).not.toHaveBeenCalled();
    });

    it('should call onBeforeSignin before redirecting', async () => {
      const onBeforeSignin = jest.fn(async () => undefined);
      const authRef = makeAuthRef({ isAuthenticated: false });
      const importComponent = jest.fn(async () => ({ default: Secret }));
      const Protected = withAuthenticationRequiredAsync(importComponent, {
        onBeforeSignin,
      });
      const Host = defineComponent({
        setup() {
          provide(AuthContextKey, authRef);
          return () => h(Protected);
        },
      });

      mount(Host);
      await flushPromises();
      await flushPromises();
      expect(onBeforeSignin).toHaveBeenCalled();
      expect(authRef.value.signinRedirect).toHaveBeenCalled();
    });
  });
});
