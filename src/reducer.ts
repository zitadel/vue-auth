import type { User } from 'oidc-client-ts';
import { ref, type Ref } from 'vue';

import type { AuthState, ErrorContext } from './AuthState.js';

/**
 * The set of actions understood by {@link reducer}.
 */
type Action =
  | { type: 'INITIALISED' | 'USER_LOADED'; user: User | null }
  | { type: 'USER_UNLOADED' }
  | { type: 'USER_SIGNED_OUT' }
  | {
      type: 'NAVIGATOR_INIT';
      method: NonNullable<AuthState['activeNavigator']>;
    }
  | { type: 'NAVIGATOR_CLOSE' }
  | { type: 'ERROR'; error: ErrorContext };

/**
 * Reduces auth actions into the state exposed by the {@link useAuth}
 * composable.
 *
 * @param state - The current auth state.
 * @param action - The action to apply.
 * @returns The next auth state.
 *
 * @example
 * ```ts
 * import { reducer } from '@zitadel/vue-auth';
 *
 * const next = reducer(
 *   { isLoading: true, isAuthenticated: false },
 *   { type: 'NAVIGATOR_INIT', method: 'signinRedirect' },
 * );
 * ```
 *
 * @public
 */
export const reducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case 'INITIALISED':
    case 'USER_LOADED':
      return {
        ...state,
        user: action.user,
        isLoading: false,
        isAuthenticated: action.user ? !action.user.expired : false,
        error: undefined,
      };
    case 'USER_SIGNED_OUT':
    case 'USER_UNLOADED':
      return {
        ...state,
        user: undefined,
        isAuthenticated: false,
      };
    case 'NAVIGATOR_INIT':
      return {
        ...state,
        isLoading: true,
        activeNavigator: action.method,
      };
    case 'NAVIGATOR_CLOSE':
      // We intentionally don't handle cases where multiple concurrent
      // navigators are open.
      return {
        ...state,
        isLoading: false,
        activeNavigator: undefined,
      };
    case 'ERROR': {
      const error = action.error;
      error['toString'] = () => `${error.name}: ${error.message}`;
      return {
        ...state,
        isLoading: false,
        error,
      };
    }
    default: {
      const innerError = new TypeError(
        `unknown type ${(action as { type: string }).type}`,
      );
      const error = {
        name: innerError.name,
        message: innerError.message,
        innerError,
        stack: innerError.stack,
        source: 'unknown',
      } satisfies ErrorContext;
      error['toString'] = () => `${error.name}: ${error.message}`;
      return {
        ...state,
        isLoading: false,
        error,
      };
    }
  }
};

/**
 * A small `useReducer`-style helper backed by a Vue {@link Ref}. Mirrors the
 * React reducer pattern used by the sibling React library.
 *
 * @param reduce - The reducer function.
 * @param initialArg - The initial state.
 * @returns A reactive `state` ref and a `dispatch` function.
 *
 * @example
 * ```ts
 * import { reducer, useReducer } from '@zitadel/vue-auth';
 *
 * const { state, dispatch } = useReducer(reducer, {
 *   isLoading: true,
 *   isAuthenticated: false,
 * });
 * dispatch({ type: 'NAVIGATOR_CLOSE' });
 * ```
 *
 * @public
 */
export function useReducer(
  reduce: (state: AuthState, action: Action) => AuthState,
  initialArg: AuthState,
): { state: Ref<AuthState>; dispatch: (action: Action) => void } {
  const state = ref<AuthState>(initialArg);
  const dispatch = (action: Action): void => {
    state.value = reduce(state.value, action);
  };
  return { state, dispatch };
}
