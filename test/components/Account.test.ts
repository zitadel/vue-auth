import { describe, expect, it, jest } from '@jest/globals';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { defineComponent, h, provide, ref, type Ref } from 'vue';

import {
  AuthContextKey,
  type AuthContextProps,
} from '../../src/AuthContext.js';
import { Account } from '../../src/components/Account.js';

const makeAuthRef = (
  overrides: Partial<AuthContextProps> = {},
): Ref<AuthContextProps> => {
  const ctx = {
    isLoading: false,
    isAuthenticated: false,
    user: undefined,
    ...overrides,
  } as unknown as AuthContextProps;
  return ref(ctx) as Ref<AuthContextProps>;
};

const mountAccount = (
  authRef: Ref<AuthContextProps>,
): ReturnType<typeof mount> => {
  const Host = defineComponent({
    setup() {
      provide(AuthContextKey, authRef);
      return () => h(Account);
    },
  });
  return mount(Host, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  });
};

describe('Account', () => {
  it('should render the user profile when authenticated', () => {
    const authRef = makeAuthRef({
      isAuthenticated: true,
      user: {
        profile: { sub: 'user-1', name: 'Ada', email: 'ada@example.com' },
      } as AuthContextProps['user'],
    });
    const wrapper = mountAccount(authRef);

    expect(wrapper.text()).toContain('Account');
    expect(wrapper.text()).toContain('user-1');
    expect(wrapper.text()).toContain('Ada');
    expect(wrapper.text()).toContain('ada@example.com');
  });

  it('should fall back to a dash for missing name and email', () => {
    const authRef = makeAuthRef({
      isAuthenticated: true,
      user: { profile: { sub: 'user-1' } } as AuthContextProps['user'],
    });
    const wrapper = mountAccount(authRef);

    expect(wrapper.text()).toContain('—');
  });

  it('should sign out when the sign-out action is used', async () => {
    const signoutRedirect = jest.fn(async () => undefined);
    const authRef = makeAuthRef({
      isAuthenticated: true,
      user: { profile: { sub: 'user-1' } } as AuthContextProps['user'],
      signoutRedirect,
    } as Partial<AuthContextProps>);
    const wrapper = mountAccount(authRef);

    await wrapper.find('button').trigger('click');
    expect(signoutRedirect).toHaveBeenCalled();
  });

  it('should prompt to sign in when unauthenticated', () => {
    const wrapper = mountAccount(makeAuthRef());

    expect(wrapper.text()).toContain('You are not authenticated.');
  });
});
