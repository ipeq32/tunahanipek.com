import 'server-only';

import type { Role } from '@prisma/client';
import { syncUserLegacyRole } from '@/lib/auth/access-roles';
import { SYSTEM_ROLE_SLUGS } from '@/lib/auth/permissions';
import {
  AdminUserMutationError,
  assertCanDeleteUser,
  assertCanManageUsers,
  assertCanUpdateUserAccessRole,
} from '@/lib/admin/users/guards';
import type { AdminUserDto } from '@/lib/admin/users/types';
import { prisma } from '@/lib/prisma';
import {
  buildPaginatedResult,
  type PageSize,
  type PaginatedResult,
} from '@/lib/pagination';

const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
  hashedPassword: true,
  emailVerified: true,
  accessRole: {
    select: {
      id: true,
      name: true,
      slug: true,
      isSystem: true,
    },
  },
  accounts: {
    select: { provider: true },
  },
  _count: {
    select: {
      blogs: true,
      comments: true,
    },
  },
} as const;

function mapAdminUser(
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: Role;
    createdAt: Date;
    hashedPassword: string | null;
    emailVerified: Date | null;
    accessRole: {
      id: string;
      name: string;
      slug: string;
      isSystem: boolean;
    };
    accounts: { provider: string }[];
    _count: { blogs: number; comments: number };
  }
): AdminUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    accessRole: {
      id: user.accessRole.id,
      name: user.accessRole.name,
      slug: user.accessRole.slug,
      isSystem: user.accessRole.isSystem,
    },
    createdAt: user.createdAt.toISOString(),
    hasPassword: Boolean(user.hashedPassword),
    oauthProviders: user.accounts.map((account) => account.provider),
    blogCount: user._count.blogs,
    commentCount: user._count.comments,
    emailVerified: Boolean(user.emailVerified),
  };
}

export async function getAdminUsersDto(): Promise<AdminUserDto[]> {
  const result = await getAdminUsersPaginated(1, 100);
  return result.data;
}

export type AdminUserStats = {
  total: number;
  admins: number;
  members: number;
};

export async function getAdminUserStats(): Promise<AdminUserStats> {
  const baseWhere = { deletedAt: null };

  const [total, members] = await Promise.all([
    prisma.user.count({ where: baseWhere }),
    prisma.user.count({
      where: {
        ...baseWhere,
        accessRole: { slug: 'member' },
      },
    }),
  ]);

  return {
    total,
    members,
    admins: total - members,
  };
}

export async function getAdminUsersPaginated(
  page: number,
  limit: PageSize,
  filters: { search?: string; accessRoleId?: string } = {}
): Promise<PaginatedResult<AdminUserDto> & { stats: AdminUserStats }> {
  const skip = (page - 1) * limit;
  const query = filters.search?.trim();

  const where = {
    deletedAt: null,
    ...(filters.accessRoleId && filters.accessRoleId !== 'all'
      ? { accessRoleId: filters.accessRoleId }
      : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [total, users, stats] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ createdAt: 'desc' }],
      select: adminUserSelect,
    }),
    getAdminUserStats(),
  ]);

  return {
    ...buildPaginatedResult(users.map(mapAdminUser), page, limit, total),
    stats,
  };
}

export async function getAdminUserById(id: string): Promise<AdminUserDto | null> {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: adminUserSelect,
  });

  return user ? mapAdminUser(user) : null;
}

export async function updateAdminUserAccessRole(
  actorId: string,
  targetUserId: string,
  accessRoleId: string
): Promise<AdminUserDto> {
  await assertCanManageUsers(actorId);

  const [target, nextRole] = await Promise.all([
    prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: {
        id: true,
        role: true,
        accessRole: {
          select: { id: true, slug: true },
        },
      },
    }),
    prisma.accessRole.findUnique({
      where: { id: accessRoleId },
      select: { id: true, slug: true },
    }),
  ]);

  if (!target) {
    throw new AdminUserMutationError('USER_NOT_FOUND');
  }

  if (!nextRole) {
    throw new AdminUserMutationError('ACCESS_ROLE_NOT_FOUND');
  }

  await assertCanUpdateUserAccessRole(
    actorId,
    targetUserId,
    target.accessRole.slug,
    nextRole.slug
  );

  await syncUserLegacyRole(targetUserId, accessRoleId);

  const updated = await prisma.user.findUniqueOrThrow({
    where: { id: targetUserId },
    select: adminUserSelect,
  });

  return mapAdminUser(updated);
}

export async function softDeleteAdminUser(
  actorId: string,
  targetUserId: string
): Promise<void> {
  await assertCanManageUsers(actorId);

  const target = await prisma.user.findFirst({
    where: { id: targetUserId, deletedAt: null },
    select: {
      id: true,
      role: true,
      accessRole: { select: { slug: true } },
    },
  });

  if (!target) {
    throw new AdminUserMutationError('USER_NOT_FOUND');
  }

  await assertCanDeleteUser(
    actorId,
    targetUserId,
    target.role,
    target.accessRole.slug
  );

  await prisma.user.update({
    where: { id: targetUserId },
    data: { deletedAt: new Date() },
  });
}

export async function countActiveSuperAdmins(
  excludeUserId?: string
): Promise<number> {
  return prisma.user.count({
    where: {
      deletedAt: null,
      accessRole: { slug: SYSTEM_ROLE_SLUGS.superAdmin },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}
