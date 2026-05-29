export * from './AuthContext.js';
export * from './AuthProvider.js';
// Default export mirrors `vue-oidc-context` so `import AuthProvider from
// '@zitadel/vue-auth'` works as a drop-in.
export { AuthProvider as default } from './AuthProvider.js';
export type { AuthState, ErrorContext } from './AuthState.js';
export {
  applyOidcConfigDefaults,
  DEFAULT_OIDC_SCOPE,
  type ZitadelScopeConfig,
} from './config.js';
export { hasRole } from './hasRole.js';
export * from './useAuth.js';
export * from './useAutoSignin.js';
export { hasAuthParams } from './utils.js';
export * from './withAuthenticationRequired.js';
