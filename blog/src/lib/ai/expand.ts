import 'server-only';

import { extractJsonObject, pickString } from '@/lib/ai/parse-response';
import { buildExpandPrompt } from '@/lib/ai/prompts';
import { fetchSiteContext } from '@/lib/ai/site-context';
import { generateWithAi } from '@/lib/ai/provider';
import type { AiUsageMeta } from '@/lib/ai/usage-log';
import {
  SiteAuthRequiredError,
  type ContentFields,
  type DecryptedAiConfig,
} from '@/lib/ai/types';
import { prepareAiRichField } from '@/lib/rich-content';
import { stripHtmlText } from '@/lib/translation-form-utils';
import {
  hasSiteAuthCredentials,
  type SiteAuthCredentials,
} from '@/lib/validations/site-auth';

type ExpandParams = {
  contentType: 'blog' | 'project';
  language: string;
  fields: ContentFields;
  projectUrl?: string | null;
  authCredentials?: SiteAuthCredentials;
  config?: DecryptedAiConfig;
  usage?: AiUsageMeta;
};

function normalizeFieldsForPrompt(
  contentType: 'blog' | 'project',
  fields: ContentFields,
): Record<string, string | undefined> {
  const title = fields.title?.trim() || undefined;

  if (contentType === 'blog') {
    return {
      ...(title && { title }),
      ...(fields.summary?.trim() && {
        summary: stripHtmlText(fields.summary),
      }),
      ...(fields.content?.trim() && {
        content: stripHtmlText(fields.content),
      }),
    };
  }

  return {
    ...(title && { title }),
    ...(fields.description?.trim() && {
      description: stripHtmlText(fields.description),
    }),
  };
}

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
  let siteContext = null;

  if (params.contentType === 'project' && params.projectUrl) {
    const siteResult = await fetchSiteContext(params.projectUrl, {
      credentials: hasSiteAuthCredentials(params.authCredentials)
        ? params.authCredentials
        : undefined,
    });

    if (siteResult?.status === 'requires_auth') {
      throw new SiteAuthRequiredError(siteResult.hints);
    }

    if (siteResult?.status === 'success') {
      siteContext = siteResult.context;
    }
  }

  const prompt = buildExpandPrompt({
    contentType: params.contentType,
    language: params.language,
    fields: normalizeFieldsForPrompt(params.contentType, params.fields),
    siteContext,
  });

  const raw = await generateWithAi(prompt, {
    config: params.config,
    maxOutputTokens: 8192,
    usage: params.usage ?? {
      action: 'expand',
      context: params.contentType,
    },
  });
  const parsed = extractJsonObject(raw);
  return sanitizeExpanded(params.contentType, parsed);
}
