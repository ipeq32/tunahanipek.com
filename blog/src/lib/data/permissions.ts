import 'server-only';

import { prisma } from '@/lib/prisma';

export { seedPermissions } from '@/lib/db/access-role-store';

export async function getAllPermissionKeys(): Promise<string[]> {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ groupKey: 'asc' }, { sortOrder: 'asc' }],
    select: { key: true },
  });

  return permissions.map((item) => item.key);
}
