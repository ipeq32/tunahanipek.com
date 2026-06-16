import { hashSync } from 'bcryptjs';
import {
  getAccessRoleIdByLegacyRole,
  seedAccessRoles,
} from '../src/lib/db/access-role-store';
import { PRIMARY_SUPER_ADMIN_EMAIL } from '../src/lib/admin/users/primary-super-admin';
import { ensureSiteSnippetsSeeded } from '../src/lib/site-snippets/store';
import { prisma } from '../src/lib/prisma';
import { seedBlogs } from './seeds/seed-blogs';

async function seedAdminUser() {
  const password = hashSync('1234asdf', 12);
  const superAdminRoleId = await getAccessRoleIdByLegacyRole('SUPER_ADMIN');

  return prisma.user.upsert({
    where: { email: PRIMARY_SUPER_ADMIN_EMAIL },
    update: {
      accessRoleId: superAdminRoleId,
      role: 'SUPER_ADMIN',
    },
    create: {
      email: PRIMARY_SUPER_ADMIN_EMAIL,
      name: 'Admin',
      hashedPassword: password,
      role: 'SUPER_ADMIN',
      accessRoleId: superAdminRoleId,
      address:
        'Atatürk Mah., İstiklal Cad. No 1, Kadıköy/İstanbul, Türkiye',
      addressData: {
        version: 1,
        countryCode: 'TR',
        countryName: 'Türkiye',
        provinceId: 34,
        provinceName: 'İstanbul',
        districtId: 1421,
        districtName: 'Kadıköy',
        neighborhoodName: 'Atatürk',
        street: 'İstiklal Cad.',
        buildingNo: '1',
      },
      phone: '1234567890',
    },
  });
}

async function main() {
  await seedAccessRoles();
  const admin = await seedAdminUser();
  await ensureSiteSnippetsSeeded();
  await seedBlogs(admin.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
