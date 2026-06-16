import type { Role } from '@prisma/client';

import {
  normalizePermissions,
  PERMISSION_GROUPS,
  SYSTEM_ROLE_PRESETS,
  SYSTEM_ROLE_SLUGS,
} from '../auth/permissions';
import { prisma } from '../prisma';

export async function seedPermissions(): Promise<void> {
  let sortOrder = 0;

  for (const group of PERMISSION_GROUPS) {
    for (const key of group.permissions) {
      await prisma.permission.upsert({
        where: { key },
        update: {
          groupKey: group.key,
          sortOrder,
        },
        create: {
          key,
          groupKey: group.key,
          sortOrder,
        },
      });
      sortOrder += 1;
    }
  }
}

export async function syncRolePermissions(
  accessRoleId: string,
  permissionKeys: string[]
): Promise<void> {
  const normalized = normalizePermissions(permissionKeys);

  if (!normalized.length) {
    await prisma.rolePermission.deleteMany({ where: { accessRoleId } });
    return;
  }

  const permissions = await prisma.permission.findMany({
    where: { key: { in: normalized } },
    select: { id: true, key: true },
  });

  if (permissions.length !== normalized.length) {
    const found = new Set(permissions.map((item) => item.key));
    const missing = normalized.filter((key) => !found.has(key));
    throw new Error(`Permission catalog missing keys: ${missing.join(', ')}`);
  }

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { accessRoleId } }),
    prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        accessRoleId,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    }),
  ]);
}

export async function getDefaultAccessRoleId(): Promise<string> {
  const role = await prisma.accessRole.findUnique({
    where: { slug: SYSTEM_ROLE_SLUGS.member },
    select: { id: true },
  });

  if (!role) {
    throw new Error('Default access role not found. Run database seed.');
  }

  return role.id;
}

export async function getAccessRoleIdByLegacyRole(
  legacyRole: Role
): Promise<string> {
  const preset = SYSTEM_ROLE_PRESETS.find(
    (item) => item.legacyRole === legacyRole
  );

  if (!preset) {
    return getDefaultAccessRoleId();
  }

  const role = await prisma.accessRole.findUnique({
    where: { slug: preset.slug },
    select: { id: true },
  });

  if (!role) {
    throw new Error(`Access role not found for slug: ${preset.slug}`);
  }

  return role.id;
}

export async function resolveLegacyRoleFromAccessRoleId(
  accessRoleId: string
): Promise<Role> {
  const role = await prisma.accessRole.findUnique({
    where: { id: accessRoleId },
    select: { slug: true },
  });

  if (!role) {
    return 'USER';
  }

  const preset = SYSTEM_ROLE_PRESETS.find((item) => item.slug === role.slug);
  return preset?.legacyRole ?? 'USER';
}

export async function seedAccessRoles(): Promise<void> {
  await seedPermissions();

  for (const preset of SYSTEM_ROLE_PRESETS) {
    const role = await prisma.accessRole.upsert({
      where: { slug: preset.slug },
      update: {
        name: preset.name,
        description: preset.description,
        isSystem: true,
      },
      create: {
        name: preset.name,
        slug: preset.slug,
        description: preset.description,
        isSystem: true,
      },
      select: { id: true },
    });

    await syncRolePermissions(role.id, preset.permissions);
  }
}

export async function syncUserLegacyRole(
  userId: string,
  accessRoleId: string
): Promise<void> {
  const legacyRole = await resolveLegacyRoleFromAccessRoleId(accessRoleId);

  await prisma.user.update({
    where: { id: userId },
    data: { role: legacyRole, accessRoleId },
  });
}
