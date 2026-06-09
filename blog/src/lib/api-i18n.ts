import { defaultLocale } from '@/config';
import { resolveLanguageCode } from '@/lib/languages';

type ApiMessages = Record<string, unknown>;

const messageCache = new Map<string, ApiMessages>();

const apiMessageLoaders: Record<string, () => Promise<ApiMessages>> = {
  en: async () => (await import('../../messages/api/en.json')).default,
  tr: async () => (await import('../../messages/api/tr.json')).default,
};

async function loadApiMessages(locale: string): Promise<ApiMessages> {
  const cached = messageCache.get(locale);
  if (cached) {
    return cached;
  }

  const loader = apiMessageLoaders[locale] ?? apiMessageLoaders.en;
  const messages = await loader();
  messageCache.set(locale, messages);
  return messages;
}

function getNestedMessage(messages: ApiMessages, key: string): string | null {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return null;
  }, messages);

  return typeof value === 'string' ? value : null;
}

async function resolveApiLocale(locale?: string | null): Promise<string> {
  if (locale && apiMessageLoaders[locale]) {
    return locale;
  }

  try {
    return await resolveLanguageCode(locale);
  } catch {
    return defaultLocale;
  }
}

export async function apiMessage(
  locale: string,
  key: string,
): Promise<string> {
  const resolvedLocale = await resolveApiLocale(locale);
  const messages = await loadApiMessages(resolvedLocale);
  const message = getNestedMessage(messages, key);

  if (message) {
    return message;
  }

  const fallbackMessages = await loadApiMessages(defaultLocale);
  return getNestedMessage(fallbackMessages, key) ?? key;
}

async function resolveRequestLocaleSafe(request: Request): Promise<string> {
  try {
    const { resolveRequestLocale } = await import('@/lib/languages');
    return await resolveRequestLocale(request);
  } catch {
    return defaultLocale;
  }
}

export async function apiError(
  request: Request,
  key: string,
  status: number,
): Promise<Response> {
  const locale = await resolveRequestLocaleSafe(request);
  const error = await apiMessage(locale, key);

  return Response.json({ error }, { status });
}

export async function apiSuccessMessage(
  request: Request,
  key: string,
): Promise<string> {
  const locale = await resolveRequestLocaleSafe(request);
  return apiMessage(locale, key);
}
