import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { formatAddressLine } from '@/lib/address/format';
import { registerSchema } from '@/lib/validations/register';
import type { Prisma } from '@prisma/client';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isPublicRegistrationEnabled } from '@/lib/public-registration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!isPublicRegistrationEnabled()) {
    return NextResponse.json({ message: 'Registration is disabled' }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(
    `register:${ip}`,
    REGISTER_LIMIT,
    REGISTER_WINDOW_MS
  );

  if (!allowed) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      name,
      phone,
      addressData,
      website,
      image,
      bio,
    } = parsed.data;

    const address = formatAddressLine(addressData);

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'User already exist' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name,
        phone,
        address,
        addressData: addressData as Prisma.InputJsonValue,
        website: website || null,
        image: image || null,
        bio: bio || null,
      },
    });

    return NextResponse.json({ message: 'success' });
  } catch (error) {
    logger.error('Register failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
