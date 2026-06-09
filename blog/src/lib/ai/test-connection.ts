import 'server-only';

import { buildTestPrompt } from '@/lib/ai/prompts';
import { generateWithAi } from '@/lib/ai/provider';
import type { DecryptedAiConfig } from '@/lib/ai/types';

export async function testAiConnection(
  config: DecryptedAiConfig,
): Promise<{ ok: true; sample: string }> {
  const sample = await generateWithAi(buildTestPrompt(), { config });
  return { ok: true, sample: sample.slice(0, 100) };
}
