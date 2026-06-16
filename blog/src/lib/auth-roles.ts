import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';
import {
  hasPermission,
  PERMISSIONS,
  type Permission,
} from '@/lib/auth/permissions';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export function isModerator(
  roleOrPermissions?: string | string[],
  email?: string | null
): boolean {
  if (isPrimarySuperAdmin(email)) {
    return true;
  }

  if (Array.isArray(roleOrPermissions)) {
    return hasAnyBlogWritePermission(roleOrPermissions);
  }

  return roleOrPermissions === 'ADMIN' || roleOrPermissions === 'SUPER_ADMIN';
}

/** @deprecated Use isPrimarySuperAdmin(email) or hasUserPermission instead */
export function isSuperAdmin(email?: string | null): boolean {
  return isPrimarySuperAdmin(email);
}

export function canAutoPublish(
  roleOrPermissions?: string | string[],
  email?: string | null
): boolean {
  if (isPrimarySuperAdmin(email)) {
    return true;
  }

  if (Array.isArray(roleOrPermissions)) {
    return hasPermission(roleOrPermissions, PERMISSIONS['blog:auto-publish']);
  }

  return isModerator(roleOrPermissions);
}

export function canUpdateAnyBlog(
  permissions?: string[],
  email?: string | null
): boolean {
  return (
    isPrimarySuperAdmin(email) ||
    hasPermission(permissions, PERMISSIONS['blog:update-any'])
  );
}

export function canDeleteAnyBlog(
  permissions?: string[],
  email?: string | null
): boolean {
  return (
    isPrimarySuperAdmin(email) ||
    hasPermission(permissions, PERMISSIONS['blog:delete-any'])
  );
}

export function canPublishBlog(
  permissions?: string[],
  email?: string | null
): boolean {
  return (
    isPrimarySuperAdmin(email) ||
    hasPermission(permissions, PERMISSIONS['blog:publish'])
  );
}

function hasAnyBlogWritePermission(permissions: string[]): boolean {
  return (
    hasPermission(permissions, PERMISSIONS['blog:create']) ||
    hasPermission(permissions, PERMISSIONS['blog:update']) ||
    hasPermission(permissions, PERMISSIONS['blog:update-any'])
  );
}

export function hasUserPermission(
  permissions: string[] | undefined,
  permission: Permission,
  email?: string | null
): boolean {
  if (isPrimarySuperAdmin(email)) {
    return true;
  }

  return hasPermission(permissions, permission);
}

export const ADMIN_PANEL_PERMISSIONS: Permission[] = [
  PERMISSIONS['blog:admin-list'],
  PERMISSIONS['project:admin-list'],
  PERMISSIONS['comment:moderate'],
  PERMISSIONS['user:read'],
  PERMISSIONS['role:read'],
];

export function canAccessAdminPanel(
  permissions: string[] | undefined,
  email?: string | null
): boolean {
  if (isPrimarySuperAdmin(email)) {
    return true;
  }

  return ADMIN_PANEL_PERMISSIONS.some((permission) =>
    hasPermission(permissions, permission)
  );
}
