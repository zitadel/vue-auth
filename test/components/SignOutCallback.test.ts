import { describe, expect, it, jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { defineComponent, h, provide, ref, type Ref } from 'vue';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';

import {
  AuthContextKey,
  type AuthContextProps,
} from '../../src/AuthContext.js';
import { SignOutCallback } from '../../src/components/SignOutCallback.js';
import { flushPromises } from '../helpers.js';

const Blank = defineComponent({ setup: () => () => h('div') });

const makeRouter = (): Router =>
  createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: Blank }],
  });

const makeAuthRef = (
  overrides: Partial<AuthContextProps> = {},
): Ref<AuthContextProps> => {
  const ctx = {
    isLoading: false,
    isAuthenticated: false,
    ...overrides,
  } as unknown as AuthContextProps;
  return ref(ctx) as Ref<AuthContextProps>;
};

describe('SignOutCallback', () => {
  it('should navigate to the application root once settled', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();
    const replace = jest.spyOn(router, 'replace');
    const authRef = makeAuthRef({ isLoading: false });
    const Host = defineComponent({
      setup() {
        provide(AuthContextKey, authRef);
        return () => h(SignOutCallback);
      },
    });
    mount(Host, { global: { plugins: [router] } });

    await flushPromises();
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('should wait while still loading then navigate once settled', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();
    const replace = jest.spyOn(router, 'replace');
    const authRef = makeAuthRef({ isLoading: true });
    const Host = defineComponent({
      setup() {
        provide(AuthContextKey, authRef);
        return () => h(SignOutCallback);
      },
    });
    mount(Host, { global: { plugins: [router] } });

    await flushPromises();
    expect(replace).not.toHaveBeenCalled();

    authRef.value = { ...authRef.value, isLoading: false };
    await flushPromises();
    expect(replace).toHaveBeenCalledWith('/');
  });
});
