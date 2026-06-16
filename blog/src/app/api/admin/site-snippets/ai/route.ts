import { NextResponse } from 'next/server';

import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import {
  generateSiteSnippets,
  improveSiteSnippet,
  translateSiteSnippets,
} from '@/lib/ai/site-snippets';
import { AiNotConfiguredError } from '@/lib/ai/types';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { siteSnippetAiRequestSchema } from '@/lib/validations/site-snippets';

export const dynamic = 'force-dynamic';

const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const context = await requirePermission(PERMISSIONS['ai:content-site-copy']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const parsed = siteSnippetAiRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 }
      );
    }

    const rate = checkRateLimit(
      `site-snippet-ai:${context.userId}`,
      RATE_LIMIT,
      RATE_WINDOW_MS
    );

    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)),
          },
        }
      );
    }

    const { action, type, locale } = parsed.data;

    if (action === 'generate') {
      const items = await generateSiteSnippets({
        type,
        locale,
        count: parsed.data.count ?? 3,
        topic: parsed.data.topic,
        examples: parsed.data.lines,
        usage: {
          userId: context.userId,
          action: 'generate',
          context: type === 'TIP' ? 'site_copy_tip' : 'site_copy_footer',
        },
      });

      return NextResponse.json({ data: { items } });
    }

    if (action === 'translate') {
      const sourceLocale = parsed.data.sourceLocale;
      const lines = parsed.data.lines;

      if (!sourceLocale || !lines?.length) {
        return NextResponse.json(
          { error: 'sourceLocale and lines are required for translate' },
          { status: 400 }
        );
      }

      const items = await translateSiteSnippets({
        type,
        sourceLanguage: sourceLocale,
        targetLanguage: locale,
        items: lines,
        usage: {
          userId: context.userId,
          action: 'translate',
          context: type === 'TIP' ? 'site_copy_tip' : 'site_copy_footer',
        },
      });

      return NextResponse.json({ data: { items } });
    }

    const line = parsed.data.line;
    if (!line) {
      return NextResponse.json(
        { error: 'line is required for improve' },
        { status: 400 }
      );
    }

    const item = await improveSiteSnippet({
      type,
      locale,
      line,
      usage: {
        userId: context.userId,
        action: 'improve',
        context: type === 'TIP' ? 'site_copy_tip' : 'site_copy_footer',
      },
    });
    return NextResponse.json({ data: { item } });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json(
        {
          error:
            'AI is not configured. Enable it in Settings and add provider credentials.',
        },
        { status: 503 }
      );
    }

    logger.error('Site snippet AI generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Content generation failed',
      },
      { status: 502 }
    );
  }
}
