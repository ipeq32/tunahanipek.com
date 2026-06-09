import type { DecryptedAiConfig } from '@/lib/site-ai-settings';
import {
  AiGenerationError,
  type AiGenerateOptions,
  type AiProviderClient,
} from '@/lib/ai/types';

export class OllamaProvider implements AiProviderClient {
  constructor(private readonly config: DecryptedAiConfig) {}

  async generateText(
    prompt: string,
    options?: AiGenerateOptions,
  ): Promise<string> {
    const baseUrl = (this.config.ollamaBaseUrl || 'http://localhost:11434').replace(
      /\/$/,
      '',
    );
    const model = this.config.ollamaModel || 'llama3.2';

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [{ role: 'user', content: prompt }],
        options: {
          temperature: options?.temperature ?? 0.4,
          num_predict: options?.maxOutputTokens ?? 4096,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new AiGenerationError(
        `Ollama request failed (${res.status}): ${body.slice(0, 200)}`,
      );
    }

    const data = (await res.json()) as {
      message?: { content?: string };
    };

    const text = data.message?.content?.trim();
    if (!text) {
      throw new AiGenerationError('Ollama returned an empty response');
    }

    return text;
  }
}
