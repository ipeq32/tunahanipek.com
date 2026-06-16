import 'server-only';

export { syncRolePermissions } from '@/lib/db/access-role-store';

export const rolePermissionsSelect = {
  rolePermissions: {
    select: {
      permission: {
        select: { key: true },
      },
    },
  },
} as const;

export function extractPermissionKeys(
  rolePermissions: { permission: { key: string } }[]
): string[] {
  return rolePermissions
    .map((item) => item.permission.key)
    .sort();
}

