import 'server-only';

import type { Role } from '@prisma/client';
import {
  AdminUserMutationError,
  assertCanDeleteUser,
  assertCanUpdateUserRole,
} from '@/lib/admin/users/guards';
import type { AdminUserDto } from '@/lib/admin/users/types';
import { prisma } from '@/lib/prisma';

const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
  hashedPassword: true,
  emailVerified: true,
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
    createdAt: user.createdAt.toISOString(),
    hasPassword: Boolean(user.hashedPassword),
    oauthProviders: user.accounts.map((account) => account.provider),
    blogCount: user._count.blogs,
    commentCount: user._count.comments,
    emailVerified: Boolean(user.emailVerified),
  };
}

export async function getAdminUsersDto(): Promise<AdminUserDto[]> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    select: adminUserSelect,
  });

  return users.map(mapAdminUser);
}

export async function getAdminUserById(id: string): Promise<AdminUserDto | null> {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: adminUserSelect,
  });

  return user ? mapAdminUser(user) : null;
}

export async function updateAdminUserRole(
  actorId: string,
  targetUserId: string,
  role: Role
): Promise<AdminUserDto> {
  const target = await prisma.user.findFirst({
    where: { id: targetUserId, deletedAt: null },
    select: { id: true, role: true },
  });

  if (!target) {
    throw new AdminUserMutationError('USER_NOT_FOUND');
  }

  await assertCanUpdateUserRole(actorId, targetUserId, target.role, role);

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role },
    select: adminUserSelect,
  });

  return mapAdminUser(updated);
}

export async function softDeleteAdminUser(
  actorId: string,
  targetUserId: string
): Promise<void> {
  const target = await prisma.user.findFirst({
    where: { id: targetUserId, deletedAt: null },
    select: { id: true, role: true },
  });

  if (!target) {
    throw new AdminUserMutationError('USER_NOT_FOUND');
  }

  await assertCanDeleteUser(actorId, targetUserId, target.role);

  await prisma.user.update({
    where: { id: targetUserId },
    data: { deletedAt: new Date() },
  });
}
