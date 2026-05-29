import { describe, expect, it, jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { defineComponent, h, type Ref } from 'vue';

import { AuthProvider } from '../src/AuthProvider.js';
import type { AuthContextProps } from '../src/AuthContext.js';
import { useAuth } from '../src/useAuth.js';
import { createFakeUserManager, flushPromises } from './helpers.js';

describe('useAuth', () => {
  it('should warn when called outside an AuthProvider', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const Orphan = defineComponent({
      setup() {
        useAuth();
        return () => h('div');
      },
    });

    expect(() => mount(Orphan)).toThrow();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('AuthProvider context is undefined'),
    );
    warn.mockRestore();
  });

  it('should provide the auth context within a provider', async () => {
    const captured: { auth?: Ref<AuthContextProps> } = {};
    const Child = defineComponent({
      setup() {
        captured.auth = useAuth();
        return () => h('div');
      },
    });
    mount(AuthProvider, {
      props: { userManager: createFakeUserManager() },
      slots: { default: () => h(Child) },
    });

    await flushPromises();
    expect(captured.auth).toBeDefined();
    expect(typeof captured.auth?.value.signinRedirect).toBe('function');
  });
});
