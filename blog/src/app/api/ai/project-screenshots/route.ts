import { NextResponse } from 'next/server';
import { AiNotConfiguredError } from '@/lib/ai/types';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';
import { captureProjectScreenshots } from '@/lib/project-screenshots/capture-project-screenshots';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { projectScreenshotRequestSchema } from '@/lib/validations/project-screenshots';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  try {
    const parsed = projectScreenshotRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      );
    }

    const context = await requirePermission(PERMISSIONS['ai:content-project']);
    if (!context) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const uploadContext = await requirePermission(PERMISSIONS['upload:project-image']);
    if (!uploadContext) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rateKey = `ai-project-screenshots:${context.userId ?? getClientIp(request)}`;
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

    const result = await captureProjectScreenshots(parsed.data);

    if (result.status === 'requires_auth') {
      return NextResponse.json({ data: result });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json(
        { error: 'AI is not configured. Configure Gemini in Settings for smart selection.' },
        { status: 503 },
      );
    }

    logger.error('Project screenshot capture failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const message =
      error instanceof Error ? error.message : 'Screenshot capture failed';

    const isBrowserMissing = /Executable doesn't exist|browserType.launch/i.test(message);
    if (isBrowserMissing) {
      return NextResponse.json(
        {
          error:
            'Playwright browser is not installed on the server. Run: npx playwright install chromium',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
