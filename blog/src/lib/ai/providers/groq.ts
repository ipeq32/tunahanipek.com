import type { DecryptedAiConfig } from '@/lib/site-ai-settings';
import {
  AiGenerationError,
  type AiGenerateOptions,
  type AiProviderClient,
} from '@/lib/ai/types';

export class GroqProvider implements AiProviderClient {
  constructor(private readonly config: DecryptedAiConfig) {}

  async generateText(
    prompt: string,
    options?: AiGenerateOptions,
  ): Promise<string> {
    const apiKey = this.config.groqApiKey?.trim();
    if (!apiKey) {
      throw new AiGenerationError('Groq API key is missing');
    }

    const model = this.config.groqModel || 'llama-3.3-70b-versatile';

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxOutputTokens ?? 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new AiGenerationError(
        `Groq request failed (${res.status}): ${body.slice(0, 200)}`,
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new AiGenerationError('Groq returned an empty response');
    }

    return text;
  }
}
