import 'server-only';

import type { User } from '@prisma/client';
import {
  extractPermissionKeys,
  rolePermissionsSelect,
} from '@/lib/data/role-permissions';
import { prisma } from '@/lib/prisma';

export type AuthSessionUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  website?: string | null;
  image?: string | null;
  bio?: string | null;
  role: User['role'];
  accessRoleId: string;
  accessRoleSlug: string;
  accessRoleName: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  hasPassword: boolean;
};

const authUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  website: true,
  image: true,
  bio: true,
  role: true,
  accessRoleId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  hashedPassword: true,
  accessRole: {
    select: {
      slug: true,
      name: true,
      ...rolePermissionsSelect,
    },
  },
} as const;

type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  image: string | null;
  bio: string | null;
  role: User['role'];
  accessRoleId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  hashedPassword: string | null;
  accessRole: {
    slug: string;
    name: string;
    rolePermissions: { permission: { key: string } }[];
  };
};

export function mapAuthSessionUser(user: AuthUserRecord): AuthSessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? undefined,
    address: user.address ?? undefined,
    website: user.website,
    image: user.image ?? undefined,
    bio: user.bio ?? undefined,
    role: user.role,
    accessRoleId: user.accessRoleId,
    accessRoleSlug: user.accessRole.slug,
    accessRoleName: user.accessRole.name,
    permissions: extractPermissionKeys(user.accessRole.rolePermissions),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
    hasPassword: Boolean(user.hashedPassword),
  };
}

export async function getAuthSessionUserById(
  userId: string
): Promise<AuthSessionUser | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: authUserSelect,
  });

  return user ? mapAuthSessionUser(user) : null;
}

export async function getAuthSessionUserByEmail(
  email: string
): Promise<AuthSessionUser | null> {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: authUserSelect,
  });

  return user ? mapAuthSessionUser(user) : null;
}
