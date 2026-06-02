import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { resetPasswordWithToken } from '@/lib/password-reset';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const schema = z
  .object({
    token: z.string().min(32),
    password: z.string().min(6),
    passwordConfirm: z.string().min(6),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(parsed.data.password, 10);
    const result = await resetPasswordWithToken(
      parsed.data.token,
      hashedPassword
    );

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Reset password failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
