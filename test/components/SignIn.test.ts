import { describe, expect, it, jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { defineComponent, h, provide, ref, type Ref } from 'vue';

import {
  AuthContextKey,
  type AuthContextProps,
} from '../../src/AuthContext.js';
import { SignIn } from '../../src/components/SignIn.js';
import { RETURN_TO_KEY } from '../../src/components/SignInCallback.js';

const makeAuthRef = (
  overrides: Partial<AuthContextProps> = {},
): Ref<AuthContextProps> => {
  const ctx = {
    isLoading: false,
    isAuthenticated: false,
    user: undefined,
    signinRedirect: jest.fn(async () => undefined),
    signinPopup: jest.fn(async () => undefined),
    signinSilent: jest.fn(async () => undefined),
    signoutRedirect: jest.fn(async () => undefined),
    ...overrides,
  } as unknown as AuthContextProps;
  return ref(ctx) as Ref<AuthContextProps>;
};

const mountSignIn = (
  authRef: Ref<AuthContextProps>,
  props: Record<string, unknown> = {},
): ReturnType<typeof mount> => {
  const Host = defineComponent({
    setup() {
      provide(AuthContextKey, authRef);
      return () => h(SignIn, props);
    },
  });
  return mount(Host);
};

describe('SignIn', () => {
  it('should render the sign-in options when unauthenticated', () => {
    const wrapper = mountSignIn(makeAuthRef());

    expect(wrapper.text()).toContain('Sign in');
    expect(wrapper.findAll('button')).toHaveLength(3);
  });

  it('should trigger a redirect sign-in when the redirect button is used', async () => {
    window.sessionStorage.clear();
    const authRef = makeAuthRef();
    const wrapper = mountSignIn(authRef, { returnTo: '/dashboard' });

    await wrapper.findAll('button')[0].trigger('click');
    expect(authRef.value.signinRedirect).toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RETURN_TO_KEY)).toBe('/dashboard');
  });

  it('should trigger a popup sign-in when the popup button is used', async () => {
    window.sessionStorage.clear();
    const authRef = makeAuthRef();
    const wrapper = mountSignIn(authRef, { returnTo: '/dashboard' });

    await wrapper.findAll('button')[1].trigger('click');
    expect(authRef.value.signinPopup).toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RETURN_TO_KEY)).toBe('/dashboard');
  });

  it('should trigger a silent sign-in when the silent button is used', async () => {
    const authRef = makeAuthRef();
    const wrapper = mountSignIn(authRef);

    await wrapper.findAll('button')[2].trigger('click');
    expect(authRef.value.signinSilent).toHaveBeenCalled();
  });

  it('should not store a return path when returnTo is omitted', async () => {
    window.sessionStorage.clear();
    const authRef = makeAuthRef();
    const wrapper = mountSignIn(authRef);

    await wrapper.findAll('button')[0].trigger('click');
    expect(authRef.value.signinRedirect).toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RETURN_TO_KEY)).toBeNull();
  });

  it('should show the signed-in state when authenticated', () => {
    const authRef = makeAuthRef({
      isAuthenticated: true,
      user: { profile: { sub: 'user-1' } } as AuthContextProps['user'],
    });
    const wrapper = mountSignIn(authRef);

    expect(wrapper.text()).toContain('You are signed in as user-1.');
  });

  it('should trigger a sign-out when the sign-out action is used', async () => {
    const authRef = makeAuthRef({
      isAuthenticated: true,
      user: { profile: { sub: 'user-1' } } as AuthContextProps['user'],
    });
    const wrapper = mountSignIn(authRef);

    await wrapper.find('button').trigger('click');
    expect(authRef.value.signoutRedirect).toHaveBeenCalled();
  });
});
