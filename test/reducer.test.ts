import { describe, expect, it } from '@jest/globals';
import type { User } from 'oidc-client-ts';

import { reducer } from '../src/reducer.js';
import { initialAuthState, type AuthState } from '../src/AuthState.js';

const baseState: AuthState = { ...initialAuthState };

describe('reducer', () => {
  it('should mark the user authenticated on INITIALISED with a valid user', () => {
    const user = { expired: false } as User;
    const next = reducer(baseState, { type: 'INITIALISED', user });

    expect(next.user).toBe(user);
    expect(next.isLoading).toBe(false);
    expect(next.isAuthenticated).toBe(true);
    expect(next.error).toBeUndefined();
  });

  it('should mark the user unauthenticated on INITIALISED with no user', () => {
    const next = reducer(baseState, { type: 'INITIALISED', user: null });

    expect(next.user).toBeNull();
    expect(next.isLoading).toBe(false);
    expect(next.isAuthenticated).toBe(false);
  });

  it('should mark the user unauthenticated on INITIALISED with an expired user', () => {
    const user = { expired: true } as User;
    const next = reducer(baseState, { type: 'INITIALISED', user });

    expect(next.user).toBe(user);
    expect(next.isAuthenticated).toBe(false);
  });

  it('should update the user on USER_LOADED', () => {
    const user = { expired: false } as User;
    const next = reducer(baseState, { type: 'USER_LOADED', user });

    expect(next.user).toBe(user);
    expect(next.isAuthenticated).toBe(true);
    expect(next.isLoading).toBe(false);
  });

  it('should clear the user on USER_UNLOADED', () => {
    const start: AuthState = {
      ...baseState,
      user: { expired: false } as User,
      isAuthenticated: true,
    };
    const next = reducer(start, { type: 'USER_UNLOADED' });

    expect(next.user).toBeUndefined();
    expect(next.isAuthenticated).toBe(false);
  });

  it('should clear the user on USER_SIGNED_OUT', () => {
    const start: AuthState = {
      ...baseState,
      user: { expired: false } as User,
      isAuthenticated: true,
    };
    const next = reducer(start, { type: 'USER_SIGNED_OUT' });

    expect(next.user).toBeUndefined();
    expect(next.isAuthenticated).toBe(false);
  });

  it('should set isLoading and activeNavigator on NAVIGATOR_INIT', () => {
    const next = reducer(baseState, {
      type: 'NAVIGATOR_INIT',
      method: 'signinRedirect',
    });

    expect(next.isLoading).toBe(true);
    expect(next.activeNavigator).toBe('signinRedirect');
  });

  it('should clear isLoading and activeNavigator on NAVIGATOR_CLOSE', () => {
    const start: AuthState = {
      ...baseState,
      isLoading: true,
      activeNavigator: 'signinRedirect',
    };
    const next = reducer(start, { type: 'NAVIGATOR_CLOSE' });

    expect(next.isLoading).toBe(false);
    expect(next.activeNavigator).toBeUndefined();
  });

  it('should store the error and stop loading on ERROR', () => {
    const error = {
      name: 'Error',
      message: 'boom',
      source: 'signinCallback',
    } as AuthState['error'] & object;
    const next = reducer(baseState, { type: 'ERROR', error });

    expect(next.isLoading).toBe(false);
    expect(next.error).toBe(error);
    expect(next.error?.toString()).toBe('Error: boom');
  });

  it('should produce an unknown-source error on an unrecognised action type', () => {
    const next = reducer(baseState, {
      // @ts-expect-error deliberately invalid action type
      type: 'NOT_A_REAL_ACTION',
    });

    expect(next.isLoading).toBe(false);
    expect(next.error?.source).toBe('unknown');
    expect(next.error?.name).toBe('TypeError');
    expect(next.error?.message).toContain('unknown type NOT_A_REAL_ACTION');
    expect(next.error?.toString()).toBe(
      'TypeError: unknown type NOT_A_REAL_ACTION',
    );
  });
});
