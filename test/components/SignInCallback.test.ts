import { describe, expect, it, jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { defineComponent, h, provide, ref, type Ref } from 'vue';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';

import {
  AuthContextKey,
  type AuthContextProps,
} from '../../src/AuthContext.js';
import {
  SignInCallback,
  RETURN_TO_KEY,
} from '../../src/components/SignInCallback.js';
import { flushPromises } from '../helpers.js';

const Blank = defineComponent({ setup: () => () => h('div') });

const makeRouter = (): Router =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Blank },
      { path: '/dashboard', component: Blank },
      { path: '/auth/error', component: Blank },
    ],
  });

const makeAuthRef = (
  overrides: Partial<AuthContextProps> = {},
): Ref<AuthContextProps> => {
  const ctx = {
    isLoading: false,
    isAuthenticated: false,
    error: undefined,
    ...overrides,
  } as unknown as AuthContextProps;
  return ref(ctx) as Ref<AuthContextProps>;
};

describe('SignInCallback', () => {
  it('should navigate to the stored return path on success', async () => {
    window.sessionStorage.setItem(RETURN_TO_KEY, '/dashboard');
    const router = makeRouter();
    await router.push('/');
    await router.isReady();
    const replace = jest.spyOn(router, 'replace');
    const authRef = makeAuthRef({ isAuthenticated: true });
    const Host = defineComponent({
      setup() {
        provide(AuthContextKey, authRef);
        return () => h(SignInCallback);
      },
    });
    mount(Host, { global: { plugins: [router] } });

    await flushPromises();
    expect(replace).toHaveBeenCalledWith('/dashboard');
    expect(window.sessionStorage.getItem(RETURN_TO_KEY)).toBeNull();
  });

  it('should wait while still loading', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();
    const replace = jest.spyOn(router, 'replace');
    const authRef = makeAuthRef({ isLoading: true });
    const Host = defineComponent({
      setup() {
        provide(AuthContextKey, authRef);
        return () => h(SignInCallback);
      },
    });
    mount(Host, { global: { plugins: [router] } });

    await flushPromises();
    expect(replace).not.toHaveBeenCalled();

    authRef.value = {
      ...authRef.value,
      isLoading: false,
      isAuthenticated: true,
    };
    await flushPromises();
    expect(replace).toHaveBeenCalled();
  });

  it('should stay put when settled but not authenticated', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();
    const replace = jest.spyOn(router, 'replace');
    const authRef = makeAuthRef({ isLoading: false, isAuthenticated: false });
    const Host = defineComponent({
      setup() {
        provide(AuthContextKey, authRef);
        return () => h(SignInCallback);
      },
    });
    mount(Host, { global: { plugins: [router] } });

    await flushPromises();
    expect(replace).not.toHaveBeenCalled();
  });

  it('should navigate to the auth error route on failure', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();
    const replace = jest.spyOn(router, 'replace');
    const authRef = makeAuthRef({
      error: {
        source: 'signinCallback',
        message: 'boom',
      } as AuthContextProps['error'],
    });
    const Host = defineComponent({
      setup() {
        provide(AuthContextKey, authRef);
        return () => h(SignInCallback);
      },
    });
    mount(Host, { global: { plugins: [router] } });

    await flushPromises();
    expect(replace).toHaveBeenCalledWith('/auth/error');
  });
});
