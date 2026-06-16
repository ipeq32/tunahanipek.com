import 'server-only';

import { GeminiProvider } from '@/lib/ai/providers/gemini';
import { GroqProvider } from '@/lib/ai/providers/groq';
import { OllamaProvider } from '@/lib/ai/providers/ollama';
import {
  logAiUsage,
  resolveAiModelName,
} from '@/lib/ai/usage-log';
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
  const startedAt = Date.now();
  const config = options?.config ?? (await getDecryptedAiConfig());
  const usage = options?.usage;

  if (!config || !isAiConfigured(config)) {
    throw new AiNotConfiguredError(
      'AI is not enabled or provider credentials are missing. Configure it in Settings.',
    );
  }

  const provider = createAiProviderFromConfig(config);

  try {
    const result = await provider.generateText(prompt, options);

    if (usage) {
      void logAiUsage({
        ...usage,
        provider: config.provider,
        model: resolveAiModelName(config),
        promptChars: prompt.length,
        responseChars: result.length,
        durationMs: Date.now() - startedAt,
        success: true,
      });
    }

    return result;
  } catch (error) {
    if (usage) {
      void logAiUsage({
        ...usage,
        provider: config.provider,
        model: resolveAiModelName(config),
        promptChars: prompt.length,
        responseChars: 0,
        durationMs: Date.now() - startedAt,
        success: false,
      });
    }

    throw error;
  }
}
