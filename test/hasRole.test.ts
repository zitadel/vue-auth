import { describe, expect, it } from '@jest/globals';
import type { User } from 'oidc-client-ts';

import { hasRole } from '../src/hasRole.js';

describe('hasRole', () => {
  it('should return true when the user has the project role', () => {
    const user = {
      profile: {
        sub: 'user-1',
        'urn:zitadel:iam:org:project:roles': { admin: {} },
      },
    } as unknown as User;

    expect(hasRole(user, 'admin')).toBe(true);
  });

  it('should return false when the user lacks the role', () => {
    const user = {
      profile: {
        sub: 'user-1',
        'urn:zitadel:iam:org:project:roles': { viewer: {} },
      },
    } as unknown as User;

    expect(hasRole(user, 'admin')).toBe(false);
  });

  it('should return true for project-scoped role claims', () => {
    const user = {
      profile: {
        sub: 'user-1',
        'urn:zitadel:iam:org:project:306217913633734659:roles': {
          admin: { '306130699507728387': 'my-org.localhost' },
        },
      },
    } as unknown as User;

    expect(hasRole(user, 'admin')).toBe(true);
  });

  it('should return false when there is no user', () => {
    expect(hasRole(null, 'admin')).toBe(false);
  });
});
