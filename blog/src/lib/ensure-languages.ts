import { prisma } from '@/lib/prisma';

const DEFAULT_LANGUAGES = [
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
] as const;

export async function ensureDefaultLanguages(): Promise<void> {
  for (const language of DEFAULT_LANGUAGES) {
    await prisma.language.upsert({
      where: { code: language.code },
      create: { ...language },
      update: {
        name: language.name,
        isDefault: language.isDefault,
        isActive: language.isActive,
        sortOrder: language.sortOrder,
      },
    });
  }
}
