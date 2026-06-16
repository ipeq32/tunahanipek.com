import 'server-only';

import { translateContent } from '@/lib/ai/translate';
import { upsertBlogTranslations } from '@/lib/blog-translations';
import { logger } from '@/lib/logger';
import { getActiveLanguages } from '@/lib/languages';
import { upsertProjectTranslations } from '@/lib/project-translations';
import {
  getDecryptedAiConfig,
  isAiConfigured,
} from '@/lib/site-ai-settings';

type TranslationInput = {
  languageCode: string;
  title?: string;
  content?: string;
  summary?: string;
  description?: string;
};

type AutoFillParams = {
  entityType: 'blog' | 'project';
  entityId: string;
  providedTranslations: TranslationInput[];
};

function stripHtmlLength(value?: string): number {
  if (!value) return 0;
  return value.replace(/<[^>]*>/g, '').trim().length;
}

function isFilledTranslation(
  entityType: 'blog' | 'project',
  item: TranslationInput,
): boolean {
  const hasTitle = Boolean(item.title?.trim());
  if (!hasTitle) return false;

  if (entityType === 'blog') {
    return (
      stripHtmlLength(item.content) > 0 && stripHtmlLength(item.summary) > 0
    );
  }

  return stripHtmlLength(item.description) > 0;
}

export async function autoFillMissingTranslations(
  params: AutoFillParams,
): Promise<void> {
  const config = await getDecryptedAiConfig();
  if (!config?.enabled || !config.autoTranslateOnSave || !isAiConfigured(config)) {
    return;
  }

  const languages = await getActiveLanguages();
  const providedByCode = new Map(
    params.providedTranslations.map((t) => [t.languageCode, t]),
  );

  const source = params.providedTranslations.find((t) =>
    isFilledTranslation(params.entityType, t),
  );

  if (!source) {
    return;
  }

  const missingLanguages = languages.filter((lang) => {
    const existing = providedByCode.get(lang.code);
    return !existing || !isFilledTranslation(params.entityType, existing);
  });

  for (const targetLang of missingLanguages) {
    if (targetLang.code === source.languageCode) {
      continue;
    }

    try {
      const fields =
        params.entityType === 'blog'
          ? {
              title: source.title,
              content: source.content,
              summary: source.summary,
            }
          : {
              title: source.title,
              description: source.description,
            };

      const translated = await translateContent({
        contentType: params.entityType,
        sourceLanguage: source.languageCode,
        targetLanguage: targetLang.code,
        fields,
        config,
        usage: {
          action: 'translate',
          context: `auto_${params.entityType}`,
        },
      });

      if (params.entityType === 'blog') {
        await upsertBlogTranslations(
          params.entityId,
          [
            {
              languageCode: targetLang.code,
              title: translated.title ?? source.title ?? '',
              content: translated.content ?? '',
              summary: translated.summary ?? '',
              published: false,
            },
          ],
          false,
        );
      } else {
        await upsertProjectTranslations(params.entityId, [
          {
            languageCode: targetLang.code,
            title: translated.title ?? source.title ?? '',
            description: translated.description ?? '',
            published: false,
          },
        ]);
      }

      logger.info('Auto-filled missing translation', {
        entityType: params.entityType,
        entityId: params.entityId,
        targetLanguage: targetLang.code,
      });
    } catch (error) {
      logger.error('Failed to auto-fill translation', {
        entityType: params.entityType,
        entityId: params.entityId,
        targetLanguage: targetLang.code,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
