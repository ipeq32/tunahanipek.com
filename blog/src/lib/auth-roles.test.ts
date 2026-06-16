import { describe, expect, it } from 'vitest';
import {
  canAccessAdminPanel,
  canAutoPublish,
  hasUserPermission,
  isModerator,
  isSuperAdmin,
} from './auth-roles';
import { PERMISSIONS } from './auth/permissions';
import { PRIMARY_SUPER_ADMIN_EMAIL } from './admin/users/primary-super-admin';

const editorPermissions = [
  PERMISSIONS['blog:create'],
  PERMISSIONS['blog:auto-publish'],
];

describe('auth-roles', () => {
  it('identifies moderators by legacy role', () => {
    expect(isModerator('ADMIN')).toBe(true);
    expect(isModerator('SUPER_ADMIN')).toBe(true);
    expect(isModerator('USER')).toBe(false);
  });

  it('identifies moderators by permissions', () => {
    expect(isModerator(editorPermissions)).toBe(true);
    expect(isModerator([PERMISSIONS['blog:read']])).toBe(false);
  });

  it('grants primary super admin full access via email', () => {
    expect(isSuperAdmin(PRIMARY_SUPER_ADMIN_EMAIL)).toBe(true);
    expect(
      hasUserPermission([], PERMISSIONS['role:delete'], PRIMARY_SUPER_ADMIN_EMAIL)
    ).toBe(true);
    expect(canAccessAdminPanel([], PRIMARY_SUPER_ADMIN_EMAIL)).toBe(true);
  });

  it('does not grant full access to super-admin role alone', () => {
    expect(isSuperAdmin('other@example.com')).toBe(false);
    expect(
      hasUserPermission([], PERMISSIONS['role:delete'], 'other@example.com')
    ).toBe(false);
  });

  it('allows auto publish for moderators', () => {
    expect(canAutoPublish('ADMIN')).toBe(true);
    expect(canAutoPublish(editorPermissions)).toBe(true);
    expect(canAutoPublish('USER')).toBe(false);
  });
});
