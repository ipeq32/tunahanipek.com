import 'server-only';

import type { Role } from '@prisma/client';
import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';
import { prisma } from '@/lib/prisma';
import type { AdminUserMutationErrorCode } from './types';

export class AdminUserMutationError extends Error {
  constructor(public readonly code: AdminUserMutationErrorCode) {
    super(code);
    this.name = 'AdminUserMutationError';
  }
}

export async function assertCanManageUsers(actorId: string): Promise<void> {
  const actor = await prisma.user.findFirst({
    where: { id: actorId, deletedAt: null },
    select: { email: true },
  });

  if (!actor || !isPrimarySuperAdmin(actor.email)) {
    throw new AdminUserMutationError('USER_MANAGEMENT_FORBIDDEN');
  }
}

async function countActiveSuperAdmins(excludeUserId?: string): Promise<number> {
  return prisma.user.count({
    where: {
      deletedAt: null,
      role: 'SUPER_ADMIN',
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export async function assertCanUpdateUserRole(
  actorId: string,
  targetUserId: string,
  currentRole: Role,
  newRole: Role
): Promise<void> {
  if (currentRole === newRole) {
    return;
  }

  if (actorId === targetUserId && newRole !== 'SUPER_ADMIN') {
    throw new AdminUserMutationError('SELF_ROLE_CHANGE_FORBIDDEN');
  }

  if (currentRole === 'SUPER_ADMIN' && newRole !== 'SUPER_ADMIN') {
    const remainingSuperAdmins = await countActiveSuperAdmins(targetUserId);
    if (remainingSuperAdmins === 0) {
      throw new AdminUserMutationError('LAST_SUPER_ADMIN_FORBIDDEN');
    }
  }
}

export async function assertCanDeleteUser(
  actorId: string,
  targetUserId: string,
  targetRole: Role
): Promise<void> {
  if (actorId === targetUserId) {
    throw new AdminUserMutationError('SELF_DELETE_FORBIDDEN');
  }

  if (targetRole === 'SUPER_ADMIN') {
    const remainingSuperAdmins = await countActiveSuperAdmins(targetUserId);
    if (remainingSuperAdmins === 0) {
      throw new AdminUserMutationError('LAST_SUPER_ADMIN_FORBIDDEN');
    }
  }
}
