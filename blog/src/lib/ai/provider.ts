import 'server-only';

import { GeminiProvider } from '@/lib/ai/providers/gemini';
import { GroqProvider } from '@/lib/ai/providers/groq';
import { OllamaProvider } from '@/lib/ai/providers/ollama';
import {
  AiNotConfiguredError,
  type AiGenerateOptions,
  type AiProviderClient,
} from '@/lib/ai/types';
import {
  getDecryptedAiConfig,
  isAiConfigured,
  type DecryptedAiConfig,
} from '@/lib/site-ai-settings';

export function createAiProviderFromConfig(
  config: DecryptedAiConfig,
): AiProviderClient {
  switch (config.provider) {
    case 'groq':
      return new GroqProvider(config);
    case 'ollama':
      return new OllamaProvider(config);
    default:
      return new GeminiProvider(config);
  }
}

export async function getAiProvider(
  overrideConfig?: DecryptedAiConfig,
): Promise<AiProviderClient> {
  const config = overrideConfig ?? (await getDecryptedAiConfig());

  if (!config || !isAiConfigured(config)) {
    throw new AiNotConfiguredError(
      'AI is not enabled or provider credentials are missing. Configure it in Settings.',
    );
  }

  return createAiProviderFromConfig(config);
}

export async function generateWithAi(
  prompt: string,
  options?: AiGenerateOptions & { config?: DecryptedAiConfig },
): Promise<string> {
  const provider = await getAiProvider(options?.config);
  return provider.generateText(prompt, options);
}
