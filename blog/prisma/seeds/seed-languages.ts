import { prisma } from '../../src/lib/prisma';

export async function seedLanguagesIfEmpty(): Promise<void> {
  const count = await prisma.language.count();
  if (count > 0) {
    await prisma.language.updateMany({ data: { isDefault: false } });
    await prisma.language.update({
      where: { code: 'tr' },
      data: { isDefault: true },
    });
    return;
  }

  await prisma.language.createMany({
    data: [
      {
        code: 'tr',
        name: 'Türkçe',
        isDefault: true,
        isActive: true,
        sortOrder: 0,
      },
      {
        code: 'en',
        name: 'English',
        isDefault: false,
        isActive: true,
        sortOrder: 1,
      },
    ],
  });
}
