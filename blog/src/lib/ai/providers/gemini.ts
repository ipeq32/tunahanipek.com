import type { DecryptedAiConfig } from '@/lib/site-ai-settings';
import {
  AiGenerationError,
  type AiGenerateOptions,
  type AiProviderClient,
} from '@/lib/ai/types';

export class GeminiProvider implements AiProviderClient {
  constructor(private readonly config: DecryptedAiConfig) {}

  async generateText(
    prompt: string,
    options?: AiGenerateOptions,
  ): Promise<string> {
    const apiKey = this.config.geminiApiKey?.trim();
    if (!apiKey) {
      throw new AiGenerationError('Gemini API key is missing');
    }

    const model = this.config.geminiModel || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.4,
          maxOutputTokens: options?.maxOutputTokens ?? 4096,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new AiGenerationError(
        `Gemini request failed (${res.status}): ${body.slice(0, 200)}`,
      );
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new AiGenerationError('Gemini returned an empty response');
    }

    return text;
  }
}
