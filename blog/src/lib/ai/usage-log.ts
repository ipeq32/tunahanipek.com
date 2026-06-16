import 'server-only';

import type { AiProvider, AiUsageAction } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { DecryptedAiConfig } from '@/lib/site-ai-settings';

export type AiUsageMeta = {
  userId?: string | null;
  action: AiUsageAction;
  context: string;
};

export type AiUsageLogInput = AiUsageMeta & {
  provider: AiProvider;
  model: string;
  promptChars: number;
  responseChars: number;
  durationMs: number;
  success: boolean;
};

export function resolveAiModelName(config: DecryptedAiConfig): string {
  switch (config.provider) {
    case 'groq':
      return config.groqModel;
    case 'ollama':
      return config.ollamaModel;
    default:
      return config.geminiModel;
  }
}

export async function logAiUsage(input: AiUsageLogInput): Promise<void> {
  try {
    await prisma.aiUsageLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        context: input.context,
        provider: input.provider,
        model: input.model,
        promptChars: input.promptChars,
        responseChars: input.responseChars,
        durationMs: input.durationMs,
        success: input.success,
      },
    });
  } catch (error) {
    logger.warn('Failed to persist AI usage log', {
      action: input.action,
      context: input.context,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
