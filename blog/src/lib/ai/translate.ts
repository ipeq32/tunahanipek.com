import 'server-only';

import { extractJsonObject, pickString } from '@/lib/ai/parse-response';
import { buildTranslatePrompt } from '@/lib/ai/prompts';
import { generateWithAi } from '@/lib/ai/provider';
import type { ContentFields, DecryptedAiConfig } from '@/lib/ai/types';
import { prepareAiRichField } from '@/lib/rich-content';

type TranslateParams = {
  contentType: 'blog' | 'project';
  sourceLanguage: string;
  targetLanguage: string;
  fields: ContentFields;
  config?: DecryptedAiConfig;
};

function sanitizeFields(
  contentType: 'blog' | 'project',
  data: Record<string, unknown>,
): ContentFields {
  const title = pickString(data, 'title');

  if (contentType === 'blog') {
    const content = pickString(data, 'content');
    const summary = pickString(data, 'summary');
    return {
      ...(title && { title }),
      ...(content && {
        content: prepareAiRichField(content, {
          contentType: 'blog',
          field: 'content',
        }),
      }),
      ...(summary && {
        summary: prepareAiRichField(summary, {
          contentType: 'blog',
          field: 'summary',
        }),
      }),
    };
  }

  const description = pickString(data, 'description');
  return {
    ...(title && { title }),
    ...(description && {
      description: prepareAiRichField(description, {
        contentType: 'project',
        field: 'description',
      }),
    }),
  };
}

export async function translateContent(
  params: TranslateParams,
): Promise<ContentFields> {
  const prompt = buildTranslatePrompt({
    contentType: params.contentType,
    sourceLanguage: params.sourceLanguage,
    targetLanguage: params.targetLanguage,
    fields: params.fields as Record<string, string | undefined>,
  });

  const raw = await generateWithAi(prompt, { config: params.config });
  const parsed = extractJsonObject(raw);
  return sanitizeFields(params.contentType, parsed);
}
