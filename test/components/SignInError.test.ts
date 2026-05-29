import { describe, expect, it } from '@jest/globals';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { defineComponent, h, provide, ref, type Ref } from 'vue';

import {
  AuthContextKey,
  type AuthContextProps,
} from '../../src/AuthContext.js';
import { SignInError } from '../../src/components/SignInError.js';

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

const mountError = (
  authRef: Ref<AuthContextProps>,
): ReturnType<typeof mount> => {
  const Host = defineComponent({
    setup() {
      provide(AuthContextKey, authRef);
      return () => h(SignInError);
    },
  });
  return mount(Host, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  });
};

describe('SignInError', () => {
  it('should render the most recent error when present', () => {
    const authRef = makeAuthRef({
      error: {
        source: 'signinCallback',
        message: 'bad code',
      } as AuthContextProps['error'],
    });
    const wrapper = mountError(authRef);

    expect(wrapper.text()).toContain('signinCallback: bad code');
  });

  it('should render a fallback message when no error is present', () => {
    const wrapper = mountError(makeAuthRef());

    expect(wrapper.text()).toContain('An unknown error occurred.');
  });
});
