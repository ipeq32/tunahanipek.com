import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  withDefaultRolePermissions,
} from './permissions';

describe('withDefaultRolePermissions', () => {
  it('always includes base user permissions', () => {
    const result = withDefaultRolePermissions([PERMISSIONS['blog:create']]);

    for (const permission of DEFAULT_ROLE_PERMISSIONS) {
      expect(result).toContain(permission);
    }
    expect(result).toContain(PERMISSIONS['blog:create']);
  });

  it('does not duplicate permissions', () => {
    const result = withDefaultRolePermissions([...DEFAULT_ROLE_PERMISSIONS]);

    expect(result).toHaveLength(DEFAULT_ROLE_PERMISSIONS.length);
  });
});
