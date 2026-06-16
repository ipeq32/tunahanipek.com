export type AccessRoleWithPermissions = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  rolePermissions: { permission: { key: string } }[];
  _count?: { users: number };
};

export type AccessRoleDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AccessRoleMutationErrorCode =
  | 'ROLE_NOT_FOUND'
  | 'ROLE_SLUG_EXISTS'
  | 'ROLE_SYSTEM_IMMUTABLE'
  | 'ROLE_IN_USE'
  | 'ROLE_PERMISSION_FORBIDDEN'
  | 'INVALID_PERMISSIONS';

export function mapAccessRoleToDto(role: AccessRoleWithPermissions): AccessRoleDto {
  return {
    id: role.id,
    name: role.name,
    slug: role.slug,
    description: role.description,
    permissions: role.rolePermissions
      .map((item) => item.permission.key)
      .sort(),
    isSystem: role.isSystem,
    userCount: role._count?.users ?? 0,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}
