import 'server-only';

import {
  AccessRoleMutationError,
  assertCanMutateRole,
  assertValidRolePermissions,
} from '@/lib/admin/roles/guards';
import {
  mapAccessRoleToDto,
  type AccessRoleDto,
  type AccessRoleWithPermissions,
} from '@/lib/admin/roles/types';
import {
  extractPermissionKeys,
  rolePermissionsSelect,
  syncRolePermissions,
} from '@/lib/data/role-permissions';
import { withDefaultRolePermissions } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

const accessRoleSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  ...rolePermissionsSelect,
  _count: {
    select: { users: true },
  },
} as const;

export async function getAccessRolesDto(): Promise<AccessRoleDto[]> {
  const roles = await prisma.accessRole.findMany({
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    select: accessRoleSelect,
  });

  return roles.map((role) => mapAccessRoleToDto(role as AccessRoleWithPermissions));
}

export async function getAccessRoleById(id: string): Promise<AccessRoleDto | null> {
  const role = await prisma.accessRole.findUnique({
    where: { id },
    select: accessRoleSelect,
  });

  return role ? mapAccessRoleToDto(role as AccessRoleWithPermissions) : null;
}

export async function createAccessRole(input: {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
}): Promise<AccessRoleDto> {
  const permissionKeys = assertValidRolePermissions(
    withDefaultRolePermissions(input.permissions)
  );

  const existing = await prisma.accessRole.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });

  if (existing) {
    throw new AccessRoleMutationError('ROLE_SLUG_EXISTS');
  }

  const role = await prisma.accessRole.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      isSystem: false,
    },
    select: { id: true },
  });

  await syncRolePermissions(role.id, permissionKeys);

  const created = await getAccessRoleById(role.id);
  if (!created) {
    throw new AccessRoleMutationError('ROLE_NOT_FOUND');
  }

  return created;
}

export async function updateAccessRole(
  id: string,
  input: {
    name?: string;
    description?: string | null;
    permissions?: string[];
  }
): Promise<AccessRoleDto> {
  const existing = await prisma.accessRole.findUnique({
    where: { id },
    select: { id: true, isSystem: true },
  });

  if (!existing) {
    throw new AccessRoleMutationError('ROLE_NOT_FOUND');
  }

  assertCanMutateRole(existing.isSystem);

  if (
    input.name !== undefined ||
    input.description !== undefined
  ) {
    await prisma.accessRole.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      },
    });
  }

  if (input.permissions !== undefined) {
    await syncRolePermissions(
      id,
      assertValidRolePermissions(
        withDefaultRolePermissions(input.permissions)
      )
    );
  }

  const updated = await getAccessRoleById(id);
  if (!updated) {
    throw new AccessRoleMutationError('ROLE_NOT_FOUND');
  }

  return updated;
}

export async function deleteAccessRole(id: string): Promise<void> {
  const existing = await prisma.accessRole.findUnique({
    where: { id },
    select: {
      id: true,
      isSystem: true,
      _count: { select: { users: true } },
    },
  });

  if (!existing) {
    throw new AccessRoleMutationError('ROLE_NOT_FOUND');
  }

  assertCanMutateRole(existing.isSystem);

  if (existing._count.users > 0) {
    throw new AccessRoleMutationError('ROLE_IN_USE');
  }

  await prisma.accessRole.delete({ where: { id } });
}

export async function getPermissionKeysForRole(
  accessRoleId: string
): Promise<string[]> {
  const role = await prisma.accessRole.findUnique({
    where: { id: accessRoleId },
    select: rolePermissionsSelect,
  });

  return role ? extractPermissionKeys(role.rolePermissions) : [];
}
