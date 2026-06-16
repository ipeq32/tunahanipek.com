import { NextResponse } from 'next/server';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { testAiConnection } from '@/lib/ai/test-connection';
import { AiNotConfiguredError } from '@/lib/ai/types';
import { logger } from '@/lib/logger';
import { isAiConfigured } from '@/lib/site-ai-settings';
import type { DecryptedAiConfig } from '@/lib/site-ai-settings';
import { testAiSettingsSchema } from '@/lib/validations/ai-settings';

export const dynamic = 'force-dynamic';

function buildDraftConfig(
  body: ReturnType<typeof testAiSettingsSchema.parse>,
  existing?: DecryptedAiConfig | null,
): DecryptedAiConfig {
  return {
    enabled: true,
    provider: body.provider,
    geminiApiKey:
      body.geminiApiKey?.trim() || existing?.geminiApiKey || null,
    groqApiKey: body.groqApiKey?.trim() || existing?.groqApiKey || null,
    geminiModel: body.geminiModel,
    groqModel: body.groqModel,
    ollamaBaseUrl: body.ollamaBaseUrl,
    ollamaModel: body.ollamaModel,
    autoTranslateOnSave: body.autoTranslateOnSave,
  };
}

export async function POST(request: Request) {
  const context = await requirePermission(PERMISSIONS['ai:settings-test']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const parsed = testAiSettingsSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      );
    }

    const { getDecryptedAiConfig } = await import('@/lib/site-ai-settings');
    const existing = await getDecryptedAiConfig();
    const draft = buildDraftConfig(parsed.data, existing);

    if (!isAiConfigured(draft)) {
      return NextResponse.json(
        { error: 'Provider credentials are incomplete' },
        { status: 400 },
      );
    }

    const result = await testAiConnection(draft);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logger.error('AI connection test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Connection test failed',
      },
      { status: 502 },
    );
  }
}
