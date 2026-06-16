import 'server-only';

import { extractJsonObject, pickString } from '@/lib/ai/parse-response';
import { buildExpandPrompt } from '@/lib/ai/prompts';
import { generateWithAi } from '@/lib/ai/provider';
import type { AiUsageMeta } from '@/lib/ai/usage-log';
import type { ContentFields, DecryptedAiConfig } from '@/lib/ai/types';
import { prepareAiRichField } from '@/lib/rich-content';

type ExpandParams = {
  contentType: 'blog' | 'project';
  language: string;
  fields: ContentFields;
  config?: DecryptedAiConfig;
  usage?: AiUsageMeta;
};

function sanitizeExpanded(
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

export async function expandContent(
  params: ExpandParams,
): Promise<ContentFields> {
  const prompt = buildExpandPrompt({
    contentType: params.contentType,
    language: params.language,
    fields: params.fields as Record<string, string | undefined>,
  });

  const raw = await generateWithAi(prompt, {
    config: params.config,
    usage: params.usage ?? {
      action: 'expand',
      context: params.contentType,
    },
  });
  const parsed = extractJsonObject(raw);
  return sanitizeExpanded(params.contentType, parsed);
}
