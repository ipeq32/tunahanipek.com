import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { isPrimarySuperAdmin } from '@/lib/admin/users/primary-super-admin';

export async function requireSuperAdminSession(): Promise<Session | null> {
  const session = await auth();

  if (!session?.user?.id || !isPrimarySuperAdmin(session.user.email)) {
    return null;
  }

  return session;
}
