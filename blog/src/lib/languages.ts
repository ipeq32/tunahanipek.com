import { prisma } from '@/lib/prisma';
import { defaultLocale, locales } from '@/config';
import { ensureDefaultLanguages } from '@/lib/ensure-languages';
import {
  getStaticLanguageFallback,
  type LanguageDto,
} from '@/lib/language-fallback';

export type { LanguageDto };

export async function queryActiveLanguages(): Promise<LanguageDto[]> {
  return prisma.language.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    select: {
      id: true,
      code: true,
      name: true,
      isDefault: true,
      isActive: true,
      sortOrder: true,
    },
  });
}

export async function getActiveLanguages(): Promise<LanguageDto[]> {
  try {
    await ensureDefaultLanguages();
    const languages = await queryActiveLanguages();
    return languages.length > 0 ? languages : getStaticLanguageFallback();
  } catch {
    return getStaticLanguageFallback();
  }
}

export async function getDefaultLanguageCode(): Promise<string> {
  const languages = await getActiveLanguages();
  const defaultLang = languages.find((l) => l.isDefault);
  return defaultLang?.code ?? defaultLocale;
}

export async function getLanguageByCode(
  code: string,
): Promise<LanguageDto | null> {
  const languages = await getActiveLanguages();
  return languages.find((l) => l.code === code) ?? null;
}

export async function resolveLanguageCode(
  requested?: string | null,
): Promise<string> {
  const languages = await getActiveLanguages();
  const codes = new Set(languages.map((l) => l.code));

  if (requested && codes.has(requested)) {
    return requested;
  }

  const defaultLang = languages.find((l) => l.isDefault);
  if (defaultLang) {
    return defaultLang.code;
  }

  if (languages[0]) {
    return languages[0].code;
  }

  return defaultLocale;
}

export function parseAcceptLanguage(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const parts = header.split(',').map((part) => {
    const [lang, qPart] = part.trim().split(';');
    const q = qPart?.startsWith('q=') ? Number(qPart.slice(2)) : 1;
    return {
      lang: lang.split('-')[0]?.toLowerCase(),
      q: Number.isFinite(q) ? q : 0,
    };
  });

  parts.sort((a, b) => b.q - a.q);
  return parts[0]?.lang ?? null;
}

export async function resolveRequestLocale(
  request: Request,
): Promise<string> {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get('locale');
  const headerLocale =
    request.headers.get('x-locale') ??
    parseAcceptLanguage(request.headers.get('accept-language'));

  return resolveLanguageCode(queryLocale ?? headerLocale);
}

export function isConfiguredLocale(code: string): boolean {
  return (locales as readonly string[]).includes(code);
}
