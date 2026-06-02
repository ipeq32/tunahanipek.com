import { prisma } from '../src/lib/prisma';
import { hashSync } from 'bcryptjs';

async function main() {
  const password = hashSync('1234asdf', 12);

  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@admin.com' },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: 'admin@admin.com',
        name: 'Admin',
        hashedPassword: password,
        role: 'SUPER_ADMIN',
        address: 'Admin address',
        phone: '1234567890',
      },
    });
  }
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
