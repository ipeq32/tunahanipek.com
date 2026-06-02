import { hashSync } from 'bcryptjs';
import { prisma } from '../src/lib/prisma';
import { seedBlogs } from './seeds/seed-blogs';

const ADMIN_EMAIL = 'admin@admin.com';

async function seedAdminUser() {
  const password = hashSync('1234asdf', 12);

  return prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: 'Admin',
      hashedPassword: password,
      role: 'SUPER_ADMIN',
      address: 'Admin address',
      phone: '1234567890',
    },
  });
}

async function main() {
  const admin = await seedAdminUser();
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
