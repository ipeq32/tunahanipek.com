import type { Role } from '@prisma/client';
import { SYSTEM_ROLE_SLUGS } from '@/lib/auth/permissions';
import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';
import { countActiveSuperAdmins } from '@/lib/data/users';
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

export async function assertCanUpdateUserAccessRole(
  actorId: string,
  targetUserId: string,
  currentRoleSlug: string,
  nextRoleSlug: string
): Promise<void> {
  if (currentRoleSlug === nextRoleSlug) {
    return;
  }

  if (
    actorId === targetUserId &&
    nextRoleSlug !== SYSTEM_ROLE_SLUGS.superAdmin
  ) {
    throw new AdminUserMutationError('SELF_ROLE_CHANGE_FORBIDDEN');
  }

  if (
    currentRoleSlug === SYSTEM_ROLE_SLUGS.superAdmin &&
    nextRoleSlug !== SYSTEM_ROLE_SLUGS.superAdmin
  ) {
    const remainingSuperAdmins = await countActiveSuperAdmins(targetUserId);
    if (remainingSuperAdmins === 0) {
      throw new AdminUserMutationError('LAST_SUPER_ADMIN_FORBIDDEN');
    }
  }
}

export async function assertCanDeleteUser(
  actorId: string,
  targetUserId: string,
  targetRole: Role,
  targetRoleSlug: string
): Promise<void> {
  if (actorId === targetUserId) {
    throw new AdminUserMutationError('SELF_DELETE_FORBIDDEN');
  }

  if (targetRoleSlug === SYSTEM_ROLE_SLUGS.superAdmin) {
    const remainingSuperAdmins = await countActiveSuperAdmins(targetUserId);
    if (remainingSuperAdmins === 0) {
      throw new AdminUserMutationError('LAST_SUPER_ADMIN_FORBIDDEN');
    }
  }

  void targetRole;
}
