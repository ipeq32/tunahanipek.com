import 'server-only';

import { extractJsonObject } from '@/lib/ai/parse-response';
import { AiGenerationError } from '@/lib/ai/types';
import type { DecryptedAiConfig } from '@/lib/site-ai-settings';

type GeminiVisionPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

export async function generateGeminiVisionJson(
  config: DecryptedAiConfig,
  prompt: string,
  images: Array<{ mimeType: string; base64: string }>,
  options?: { temperature?: number; maxOutputTokens?: number },
): Promise<Record<string, unknown>> {
  const apiKey = config.geminiApiKey?.trim();
  if (!apiKey) {
    throw new AiGenerationError('Gemini API key is missing');
  }

  const model = config.geminiModel || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const parts: GeminiVisionPart[] = [{ text: prompt }];
  for (const image of images) {
    parts.push({
      inline_data: {
        mime_type: image.mimeType,
        data: image.base64,
      },
    });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxOutputTokens ?? 1024,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AiGenerationError(
      `Gemini vision request failed (${res.status}): ${body.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new AiGenerationError('Gemini vision returned an empty response');
  }

  return extractJsonObject(text);
}
