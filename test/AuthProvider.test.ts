import { describe, expect, it, jest } from '@jest/globals';
import type { User } from 'oidc-client-ts';

import {
  createFakeUserManager,
  flushPromises,
  mountWithAuth,
} from './helpers.js';

/**
 * Builds an events stub that captures the handler registered for a single
 * event, so tests can invoke it to simulate a `UserManager` event firing.
 */
const capturingEvents = (): {
  events: Record<string, jest.Mock>;
  fire: (event: string, ...args: unknown[]) => void;
} => {
  const handlers: Record<string, (...args: unknown[]) => void> = {};
  const make = (event: string) =>
    jest.fn((handler: (...args: unknown[]) => void) => {
      handlers[event] = handler;
    });
  const events = {
    addUserLoaded: make('UserLoaded'),
    removeUserLoaded: jest.fn(),
    addUserUnloaded: make('UserUnloaded'),
    removeUserUnloaded: jest.fn(),
    addUserSignedOut: make('UserSignedOut'),
    removeUserSignedOut: jest.fn(),
    addSilentRenewError: make('SilentRenewError'),
    removeSilentRenewError: jest.fn(),
  } as unknown as Record<string, jest.Mock>;
  const fire = (event: string, ...args: unknown[]): void => {
    handlers[event]?.(...args);
  };
  return { events, fire };
};

describe('AuthProvider', () => {
  it('should finish loading and report unauthenticated with no user', async () => {
    const { auth } = mountWithAuth({ userManager: createFakeUserManager() });

    await flushPromises();
    expect(auth.value.isLoading).toBe(false);
    expect(auth.value.isAuthenticated).toBe(false);
    expect(auth.value.user).toBeNull();
  });

  it('should construct a UserManager from inline settings', async () => {
    // No `userManager` prop: exercises the real construction path that most
    // consumers use (authority/client_id/redirect_uri passed inline).
    const { auth } = mountWithAuth({
      authority: 'https://example.zitadel.cloud',
      client_id: 'inline-client',
      redirect_uri: 'https://app.example.com/auth/callback',
    });

    await flushPromises();
    expect(auth.value.isLoading).toBe(false);
    expect(auth.value.isAuthenticated).toBe(false);
    expect(auth.value.settings.client_id).toBe('inline-client');
  });

  it('should report authenticated when a valid user is restored', async () => {
    const user = { expired: false, profile: { sub: 'user-1' } } as User;
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({
        getUser: jest.fn(async () => user),
      }),
    });

    await flushPromises();
    expect(auth.value.isAuthenticated).toBe(true);
    expect(auth.value.user).toStrictEqual(user);
  });

  it('should report unauthenticated when the restored user is expired', async () => {
    const user = { expired: true, profile: { sub: 'user-1' } } as User;
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({
        getUser: jest.fn(async () => user),
      }),
    });

    await flushPromises();
    expect(auth.value.isLoading).toBe(false);
    expect(auth.value.isAuthenticated).toBe(false);
  });

  it('should run the signin callback when the URL has auth params', async () => {
    window.history.pushState({}, '', '/?code=abc&state=xyz');
    const signinCallback = jest.fn(async () => undefined);
    const onSigninCallback = jest.fn(async () => undefined);
    try {
      const { auth } = mountWithAuth({
        userManager: createFakeUserManager({ signinCallback }),
        onSigninCallback,
      });

      await flushPromises();
      expect(signinCallback).toHaveBeenCalled();
      expect(onSigninCallback).toHaveBeenCalled();
      expect(auth.value.isLoading).toBe(false);
    } finally {
      window.history.pushState({}, '', '/');
    }
  });

  it('should run the signout callback when matchSignoutCallback matches', async () => {
    const signoutCallback = jest.fn(async () => undefined);
    const onSignoutCallback = jest.fn(async () => undefined);
    mountWithAuth({
      userManager: createFakeUserManager({ signoutCallback }),
      matchSignoutCallback: () => true,
      onSignoutCallback,
    });

    await flushPromises();
    expect(signoutCallback).toHaveBeenCalled();
    expect(onSignoutCallback).toHaveBeenCalled();
  });

  it('should surface a signin error when getUser rejects', async () => {
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({
        getUser: jest.fn(async () => {
          throw new Error('boom');
        }),
      }),
    });

    await flushPromises();
    expect(auth.value.error).toBeDefined();
    expect(auth.value.error?.source).toBe('signinCallback');
  });

  it('should set error.source to signinCallback when the signin callback fails', async () => {
    window.history.pushState({}, '', '/?code=abc&state=xyz');
    try {
      const { auth } = mountWithAuth({
        userManager: createFakeUserManager({
          signinCallback: jest.fn(async () => {
            throw new Error('bad code');
          }),
        }),
      });

      await flushPromises();
      expect(auth.value.error?.source).toBe('signinCallback');
    } finally {
      window.history.pushState({}, '', '/');
    }
  });

  it('should set error.source to signoutCallback when the signout callback fails', async () => {
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({
        signoutCallback: jest.fn(async () => {
          throw new Error('bad logout');
        }),
      }),
      matchSignoutCallback: () => true,
    });

    await flushPromises();
    expect(auth.value.error?.source).toBe('signoutCallback');
  });

  it('should dispatch USER_LOADED on the UserLoaded event', async () => {
    const { events, fire } = capturingEvents();
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({ events }),
    });

    await flushPromises();
    const user = { expired: false, profile: { sub: 'u' } } as User;
    fire('UserLoaded', user);
    await flushPromises();
    expect(auth.value.isAuthenticated).toBe(true);
    expect(auth.value.user).toStrictEqual(user);
  });

  it('should dispatch USER_UNLOADED on the UserUnloaded event', async () => {
    const { events, fire } = capturingEvents();
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({
        events,
        getUser: jest.fn(async () => ({
          expired: false,
          profile: { sub: 'u' },
        })),
      }),
    });

    await flushPromises();
    expect(auth.value.isAuthenticated).toBe(true);
    fire('UserUnloaded');
    await flushPromises();
    expect(auth.value.isAuthenticated).toBe(false);
    expect(auth.value.user).toBeUndefined();
  });

  it('should clear the user on the UserSignedOut event', async () => {
    const { events, fire } = capturingEvents();
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({
        events,
        getUser: jest.fn(async () => ({
          expired: false,
          profile: { sub: 'u' },
        })),
      }),
    });

    await flushPromises();
    expect(auth.value.isAuthenticated).toBe(true);
    fire('UserSignedOut');
    await flushPromises();
    expect(auth.value.isAuthenticated).toBe(false);
    expect(auth.value.user).toBeUndefined();
  });

  it('should surface a renewSilent error on the SilentRenewError event', async () => {
    const { events, fire } = capturingEvents();
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({ events }),
    });

    await flushPromises();
    fire('SilentRenewError', new Error('renew failed'));
    await flushPromises();
    expect(auth.value.error?.source).toBe('renewSilent');
  });

  it('should call onRemoveUser after removeUser resolves', async () => {
    const removeUser = jest.fn(async () => undefined);
    const onRemoveUser = jest.fn(async () => undefined);
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({ removeUser }),
      onRemoveUser,
    });

    await flushPromises();
    await auth.value.removeUser();
    expect(removeUser).toHaveBeenCalled();
    expect(onRemoveUser).toHaveBeenCalled();
  });

  it('should resolve removeUser even without an onRemoveUser hook', async () => {
    const removeUser = jest.fn(async () => undefined);
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({ removeUser }),
    });

    await flushPromises();
    await auth.value.removeUser();
    expect(removeUser).toHaveBeenCalled();
  });

  it('should remove the registered event handlers on unmount', async () => {
    const { events } = capturingEvents();
    const { wrapper } = mountWithAuth({
      userManager: createFakeUserManager({ events }),
    });

    await flushPromises();
    wrapper.unmount();
    expect(events.removeUserLoaded).toHaveBeenCalled();
    expect(events.removeUserUnloaded).toHaveBeenCalled();
    expect(events.removeUserSignedOut).toHaveBeenCalled();
    expect(events.removeSilentRenewError).toHaveBeenCalled();
  });

  it('should expose hasRole through the auth context', async () => {
    const user = {
      expired: false,
      profile: {
        sub: 'user-1',
        'urn:zitadel:iam:org:project:roles': { admin: {} },
      },
    } as unknown as User;
    const { auth } = mountWithAuth({
      userManager: createFakeUserManager({
        getUser: jest.fn(async () => user),
      }),
    });

    await flushPromises();
    expect(auth.value.hasRole('admin')).toBe(true);
    expect(auth.value.hasRole('viewer')).toBe(false);
  });

  describe('navigator methods', () => {
    it('should set activeNavigator and clear it when signinRedirect resolves', async () => {
      const { auth } = mountWithAuth({ userManager: createFakeUserManager() });

      await flushPromises();
      await auth.value.signinRedirect();
      await flushPromises();
      expect(auth.value.activeNavigator).toBeUndefined();
      expect(auth.value.isLoading).toBe(false);
    });

    it('should set activeNavigator and clear it when signinPopup resolves', async () => {
      const { auth } = mountWithAuth({ userManager: createFakeUserManager() });

      await flushPromises();
      await auth.value.signinPopup();
      await flushPromises();
      expect(auth.value.activeNavigator).toBeUndefined();
      expect(auth.value.isLoading).toBe(false);
    });

    it('should set activeNavigator and clear it when signinSilent resolves', async () => {
      const { auth } = mountWithAuth({ userManager: createFakeUserManager() });

      await flushPromises();
      await auth.value.signinSilent();
      await flushPromises();
      expect(auth.value.activeNavigator).toBeUndefined();
      expect(auth.value.isLoading).toBe(false);
    });

    it('should set activeNavigator and clear it when signoutRedirect resolves', async () => {
      const { auth } = mountWithAuth({ userManager: createFakeUserManager() });

      await flushPromises();
      await auth.value.signoutRedirect();
      await flushPromises();
      expect(auth.value.activeNavigator).toBeUndefined();
      expect(auth.value.isLoading).toBe(false);
    });

    it('should set activeNavigator and clear it when signoutPopup resolves', async () => {
      const { auth } = mountWithAuth({ userManager: createFakeUserManager() });

      await flushPromises();
      await auth.value.signoutPopup();
      await flushPromises();
      expect(auth.value.activeNavigator).toBeUndefined();
      expect(auth.value.isLoading).toBe(false);
    });

    it('should report an error with the matching source when a navigator throws', async () => {
      const { auth } = mountWithAuth({
        userManager: createFakeUserManager({
          signinRedirect: jest.fn(async () => {
            throw new Error('nav boom');
          }),
        }),
      });

      await flushPromises();
      await auth.value.signinRedirect();
      await flushPromises();
      expect(auth.value.error?.source).toBe('signinRedirect');
    });
  });

  describe('unsupported environment', () => {
    it('should throw when a navigator method is missing from the UserManager', async () => {
      // A UserManager that lacks signinPopup (e.g. a server-rendered stub)
      // gets an unsupportedEnvironment shim that throws when invoked.
      const { auth } = mountWithAuth({
        userManager: createFakeUserManager({ signinPopup: undefined }),
      });

      await flushPromises();
      expect(() => auth.value.signinPopup()).toThrow('unsupported context');
    });

    it('should throw when a context method is missing from the UserManager', async () => {
      const { auth } = mountWithAuth({
        userManager: createFakeUserManager({ revokeTokens: undefined }),
      });

      await flushPromises();
      expect(() => auth.value.revokeTokens()).toThrow('unsupported context');
    });
  });
});
