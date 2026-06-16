import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { formatAddressLine } from '@/lib/address/format';
import { addressDataSchema } from '@/lib/address/types';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const profileSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  addressData: addressDataSchema,
  website: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
});

export async function PATCH(request: Request) {
  const context = await requirePermission(PERMISSIONS['profile:update']);
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, phone, addressData, website, image, bio } = parsed.data;
    const address = formatAddressLine(addressData);

    const user = await prisma.user.update({
      where: { id: context.userId },
      data: {
        name,
        phone,
        address,
        addressData: addressData as Prisma.InputJsonValue,
        website: website || null,
        image: image || null,
        bio: bio || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        addressData: true,
        website: true,
        image: true,
        bio: true,
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    logger.error('Profile update failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
