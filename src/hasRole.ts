import type { User } from 'oidc-client-ts';

/**
 * Returns whether the authenticated user holds the given Zitadel project role.
 * Scans the `urn:zitadel:iam:org:project*:roles` claims (each an object keyed
 * by role name) merged onto the user's profile.
 *
 * @param user - The authenticated user, or `null`/`undefined` when signed out.
 * @param role - The Zitadel project role name to check for.
 * @returns `true` when the user holds the role, otherwise `false`.
 *
 * @public
 */
export function hasRole(user: User | null | undefined, role: string): boolean {
  const profile = user?.profile;
  if (!profile) {
    return false;
  }
  for (const [claim, value] of Object.entries(profile)) {
    if (
      claim.startsWith('urn:zitadel:iam:org:project') &&
      claim.endsWith(':roles') &&
      value !== null &&
      typeof value === 'object'
    ) {
      if (Object.prototype.hasOwnProperty.call(value, role)) {
        return true;
      }
    }
  }
  return false;
}
