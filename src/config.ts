import type { UserManagerSettings } from 'oidc-client-ts';

/**
 * The default OIDC scope applied when the caller does not specify one. Requests
 * the standard identity scopes plus a refresh token for silent renewal.
 *
 * @public
 */
export const DEFAULT_OIDC_SCOPE = 'openid profile email offline_access';

/**
 * Zitadel-specific configuration that expands into OIDC scopes.
 *
 * @public
 */
export interface ZitadelScopeConfig {
  /** Zitadel project resource ID; adds the project-audience + roles scopes. */
  project_resource_id?: string;
  /** Restrict login to a single Zitadel organization; adds the org scope. */
  org_id?: string;
}

/**
 * Applies Zitadel-friendly defaults to OIDC settings: a sensible default
 * scope, userinfo enrichment, automatic silent renewal, and the
 * `urn:zitadel:*` scopes derived from {@link ZitadelScopeConfig}. All defaults
 * remain overridable by the caller. Returns a new object (no mutation).
 *
 * @param config - The OIDC settings plus optional Zitadel scope config.
 * @returns A new {@link UserManagerSettings} with the defaults applied.
 *
 * @public
 */
export function applyOidcConfigDefaults(
  config: UserManagerSettings & ZitadelScopeConfig,
): UserManagerSettings {
  const { project_resource_id, org_id, ...settings } = config;
  const baseScopes = (settings.scope ?? DEFAULT_OIDC_SCOPE)
    .split(' ')
    .filter(Boolean);
  const zitadelScopes: string[] = [];
  if (project_resource_id) {
    zitadelScopes.push(
      `urn:zitadel:iam:org:project:id:${project_resource_id}:aud`,
    );
    zitadelScopes.push('urn:zitadel:iam:org:projects:roles');
  }
  if (org_id) {
    zitadelScopes.push(`urn:zitadel:iam:org:id:${org_id}`);
  }
  const scope = [...new Set([...baseScopes, ...zitadelScopes])].join(' ');
  return {
    loadUserInfo: true,
    automaticSilentRenew: true,
    ...settings,
    scope,
  };
}
