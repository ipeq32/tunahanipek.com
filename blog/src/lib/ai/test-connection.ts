import 'server-only';

import { buildTestPrompt } from '@/lib/ai/prompts';
import { generateWithAi } from '@/lib/ai/provider';
import type { DecryptedAiConfig } from '@/lib/ai/types';

export async function testAiConnection(
  config: DecryptedAiConfig,
  userId?: string | null,
): Promise<{ ok: true; sample: string }> {
  const sample = await generateWithAi(buildTestPrompt(), {
    config,
    usage: {
      userId,
      action: 'test',
      context: 'settings_test',
    },
  });
  return { ok: true, sample: sample.slice(0, 100) };
}
