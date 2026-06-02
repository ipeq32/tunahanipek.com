import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPasswordResetToken } from '@/lib/password-reset';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000);

  if (!allowed) {
    return NextResponse.json(
      { message: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
    }

    const result = await createPasswordResetToken(parsed.data.email);

    return NextResponse.json({
      message: 'If the email exists, a reset link has been sent.',
      ...(result.resetUrl ? { resetUrl: result.resetUrl } : {}),
    });
  } catch (error) {
    logger.error('Forgot password failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
