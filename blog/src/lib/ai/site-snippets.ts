import 'server-only';

import {
  extractJsonObject,
  pickString,
  pickStringArray,
} from '@/lib/ai/parse-response';
import {
  buildSiteSnippetGeneratePrompt,
  buildSiteSnippetImprovePrompt,
  buildSiteSnippetTranslatePrompt,
} from '@/lib/ai/prompts';
import { generateWithAi } from '@/lib/ai/provider';
import type { DecryptedAiConfig } from '@/lib/ai/types';

type SnippetType = 'TIP' | 'FOOTER_MOTTO';

export async function generateSiteSnippets(params: {
  type: SnippetType;
  locale: string;
  count: number;
  topic?: string;
  examples?: string[];
  config?: DecryptedAiConfig;
}): Promise<string[]> {
  const prompt = buildSiteSnippetGeneratePrompt(params);
  const raw = await generateWithAi(prompt, { config: params.config });
  const parsed = extractJsonObject(raw);
  const items = pickStringArray(parsed, 'items');

  if (!items.length) {
    throw new Error('AI returned no snippet lines');
  }

  return items.slice(0, params.count);
}

export async function translateSiteSnippets(params: {
  type: SnippetType;
  sourceLanguage: string;
  targetLanguage: string;
  items: string[];
  config?: DecryptedAiConfig;
}): Promise<string[]> {
  if (!params.items.length) {
    throw new Error('No lines to translate');
  }

  const prompt = buildSiteSnippetTranslatePrompt(params);
  const raw = await generateWithAi(prompt, { config: params.config });
  const parsed = extractJsonObject(raw);
  const items = pickStringArray(parsed, 'items');

  if (!items.length) {
    throw new Error('AI returned no translated lines');
  }

  return items;
}

export async function improveSiteSnippet(params: {
  type: SnippetType;
  locale: string;
  line: string;
  config?: DecryptedAiConfig;
}): Promise<string> {
  const prompt = buildSiteSnippetImprovePrompt(params);
  const raw = await generateWithAi(prompt, { config: params.config });
  const parsed = extractJsonObject(raw);
  const item = pickString(parsed, 'item');

  if (!item) {
    throw new Error('AI returned no improved line');
  }

  return item;
}
