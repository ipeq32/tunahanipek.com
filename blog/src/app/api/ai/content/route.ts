import { NextResponse } from 'next/server';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { expandContent } from '@/lib/ai/expand';
import { translateContent } from '@/lib/ai/translate';
import { AiNotConfiguredError } from '@/lib/ai/types';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { aiContentRequestSchema } from '@/lib/validations/ai-settings';

export const dynamic = 'force-dynamic';

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  try {
    const parsed = aiContentRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      );
    }

    const { action, contentType, sourceLanguage, fields } = parsed.data;

    const permission =
      contentType === 'project'
        ? PERMISSIONS['ai:content-project']
        : PERMISSIONS['ai:content-blog'];

    const context = await requirePermission(permission);
    if (!context) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rateKey = `ai-content:${context.userId ?? getClientIp(request)}`;
    const rate = checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)),
          },
        },
      );
    }

    if (action === 'translate') {
      const targetLanguage = parsed.data.targetLanguage;
      if (!targetLanguage) {
        return NextResponse.json(
          { error: 'targetLanguage is required for translate' },
          { status: 400 },
        );
      }

      const data = await translateContent({
        contentType,
        sourceLanguage,
        targetLanguage,
        fields,
        usage: {
          userId: context.userId,
          action: 'translate',
          context: contentType,
        },
      });

      return NextResponse.json({ data });
    }

    const data = await expandContent({
      contentType,
      language: sourceLanguage,
      fields,
      usage: {
        userId: context.userId,
        action: 'expand',
        context: contentType,
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json(
        {
          error:
            'AI is not configured. Enable it in Settings and add provider credentials.',
        },
        { status: 503 },
      );
    }

    logger.error('AI content generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Content generation failed',
      },
      { status: 502 },
    );
  }
}
