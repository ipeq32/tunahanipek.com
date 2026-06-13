import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { prisma } from '@/lib/prisma';

export async function requireSuperAdminSession(): Promise<Session | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || !isSuperAdmin(dbUser.role)) {
    return null;
  }

  return session;
}
