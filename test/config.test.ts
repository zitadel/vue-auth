import { describe, expect, it } from '@jest/globals';
import type { UserManagerSettings } from 'oidc-client-ts';

import { applyOidcConfigDefaults, DEFAULT_OIDC_SCOPE } from '../src/config.js';

const base = {
  authority: 'https://example.zitadel.cloud',
  client_id: 'client',
  redirect_uri: 'https://app.example.com/auth/callback',
} as UserManagerSettings;

describe('applyOidcConfigDefaults', () => {
  it('should default scope, loadUserInfo and automaticSilentRenew', () => {
    const result = applyOidcConfigDefaults({ ...base });

    expect(result.scope).toBe(DEFAULT_OIDC_SCOPE);
    expect(result.loadUserInfo).toBe(true);
    expect(result.automaticSilentRenew).toBe(true);
  });

  it('should append the project resource id scopes', () => {
    const result = applyOidcConfigDefaults({
      ...base,
      project_resource_id: 'proj-1',
    });

    expect(result.scope).toContain('urn:zitadel:iam:org:project:id:proj-1:aud');
    expect(result.scope).toContain('urn:zitadel:iam:org:projects:roles');
  });

  it('should append the org id scope', () => {
    const result = applyOidcConfigDefaults({ ...base, org_id: 'org-1' });

    expect(result.scope).toContain('urn:zitadel:iam:org:id:org-1');
  });

  it('should not override explicit settings', () => {
    const result = applyOidcConfigDefaults({
      ...base,
      scope: 'openid custom',
      loadUserInfo: false,
      automaticSilentRenew: false,
    });

    expect(result.scope).toBe('openid custom');
    expect(result.loadUserInfo).toBe(false);
    expect(result.automaticSilentRenew).toBe(false);
  });

  it('should not duplicate scopes', () => {
    const result = applyOidcConfigDefaults({
      ...base,
      scope: 'openid urn:zitadel:iam:org:projects:roles',
      project_resource_id: 'proj-1',
    });

    const scopes = (result.scope ?? '').split(' ');
    const occurrences = scopes.filter(
      (scope) => scope === 'urn:zitadel:iam:org:projects:roles',
    );
    expect(occurrences).toHaveLength(1);
  });
});
