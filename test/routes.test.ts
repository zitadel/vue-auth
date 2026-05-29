import { describe, expect, it, jest } from '@jest/globals';
import { mount } from '@vue/test-utils';
import { defineComponent, h, provide, ref, type Ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

import { createAuthGuard, zitadelRoutes } from '../src/routes.js';
import { AuthContextKey, type AuthContextProps } from '../src/AuthContext.js';
import {
  Account,
  SignIn,
  SignInCallback,
  SignInError,
  SignOutCallback,
} from '../src/components/index.js';

const routeFor = (path: string) =>
  zitadelRoutes.find((route) => route.path === path);

/**
 * Runs {@link createAuthGuard} inside a component so {@link useAuth} can be
 * called from within an active setup context, returning the guard's result.
 */
const runGuard = (
  authRef: Ref<AuthContextProps>,
  to: Partial<RouteLocationNormalized>,
): boolean => {
  let result: boolean | undefined;
  const Child = defineComponent({
    setup() {
      const guard = createAuthGuard();
      result = guard.call(
        undefined,
        to as RouteLocationNormalized,
        {} as never,
        () => {
          // not used
        },
      ) as boolean;
      return () => h('div');
    },
  });
  const Host = defineComponent({
    setup() {
      provide(AuthContextKey, authRef);
      return () => h(Child);
    },
  });
  mount(Host);
  return result as boolean;
};

const makeAuthRef = (
  overrides: Partial<AuthContextProps> = {},
): Ref<AuthContextProps> => {
  const ctx = {
    isLoading: false,
    isAuthenticated: false,
    activeNavigator: undefined,
    signinRedirect: jest.fn(async () => undefined),
    ...overrides,
  } as unknown as AuthContextProps;
  return ref(ctx) as Ref<AuthContextProps>;
};

describe('routes', () => {
  it('should expose five auth routes', () => {
    expect(zitadelRoutes).toHaveLength(5);
  });

  it('should map /auth/signin to the sign-in component', () => {
    expect(routeFor('/auth/signin')?.component).toBe(SignIn);
  });

  it('should map /auth/callback to the sign-in callback component', () => {
    expect(routeFor('/auth/callback')?.component).toBe(SignInCallback);
  });

  it('should map /auth/error to the sign-in error component', () => {
    expect(routeFor('/auth/error')?.component).toBe(SignInError);
  });

  it('should map /auth/logout/callback to the sign-out callback component', () => {
    expect(routeFor('/auth/logout/callback')?.component).toBe(SignOutCallback);
  });

  it('should guard the /auth/account route', () => {
    const account = routeFor('/auth/account');
    expect(account?.component).toBe(Account);
    expect(account?.meta?.requiresAuth).toBe(true);
  });
});

describe('createAuthGuard', () => {
  it('should allow routes that do not require auth', () => {
    const authRef = makeAuthRef();
    const result = runGuard(authRef, { meta: {} });

    expect(result).toBe(true);
  });

  it('should allow a guarded route when authenticated', () => {
    const authRef = makeAuthRef({ isAuthenticated: true });
    const result = runGuard(authRef, { meta: { requiresAuth: true } });

    expect(result).toBe(true);
  });

  it('should block without redirecting while loading', () => {
    const authRef = makeAuthRef({ isLoading: true });
    const result = runGuard(authRef, { meta: { requiresAuth: true } });

    expect(result).toBe(false);
    expect(authRef.value.signinRedirect).not.toHaveBeenCalled();
  });

  it('should redirect to signin when unauthenticated and idle', () => {
    const authRef = makeAuthRef();
    const result = runGuard(authRef, { meta: { requiresAuth: true } });

    expect(result).toBe(false);
    expect(authRef.value.signinRedirect).toHaveBeenCalled();
  });
});
