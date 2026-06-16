import 'server-only';

import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';
import {
  hasPermission,
  type Permission,
} from '@/lib/auth/permissions';
import {
  extractPermissionKeys,
  rolePermissionsSelect,
} from '@/lib/data/role-permissions';
import { prisma } from '@/lib/prisma';

export type AuthContext = {
  session: Session;
  userId: string;
  permissions: string[];
  accessRoleSlug: string;
  isPrimarySuperAdmin: boolean;
};

export async function getUserPermissionsFromDb(
  userId: string
): Promise<{
  permissions: string[];
  accessRoleSlug: string;
  email: string;
} | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      email: true,
      accessRole: {
        select: {
          slug: true,
          ...rolePermissionsSelect,
        },
      },
    },
  });

  if (!user?.accessRole) {
    return null;
  }

  return {
    email: user.email,
    permissions: extractPermissionKeys(user.accessRole.rolePermissions),
    accessRoleSlug: user.accessRole.slug,
  };
}

function buildAuthContext(
  session: Session,
  access: { permissions: string[]; accessRoleSlug: string; email: string }
): AuthContext {
  return {
    session,
    userId: session.user.id,
    permissions: access.permissions,
    accessRoleSlug: access.accessRoleSlug,
    isPrimarySuperAdmin: isPrimarySuperAdmin(access.email),
  };
}

function isAllowed(
  context: AuthContext,
  permission: Permission
): boolean {
  if (context.isPrimarySuperAdmin) {
    return true;
  }

  return hasPermission(context.permissions, permission);
}

export async function requireAuth(): Promise<AuthContext | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const access = await getUserPermissionsFromDb(session.user.id);

  if (!access) {
    return null;
  }

  return buildAuthContext(session, access);
}

export async function requirePermission(
  permission: Permission
): Promise<AuthContext | null> {
  const context = await requireAuth();

  if (!context || !isAllowed(context, permission)) {
    return null;
  }

  return context;
}

export async function requireAnyPermission(
  permissions: Permission[]
): Promise<AuthContext | null> {
  const context = await requireAuth();

  if (!context) {
    return null;
  }

  const allowed = permissions.some((permission) =>
    isAllowed(context, permission)
  );

  return allowed ? context : null;
}

export async function requirePrimarySuperAdmin(): Promise<AuthContext | null> {
  const context = await requireAuth();

  if (!context?.isPrimarySuperAdmin) {
    return null;
  }

  return context;
}
