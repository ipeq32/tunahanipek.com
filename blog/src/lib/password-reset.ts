import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { host } from '@/config';

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase(), deletedAt: null },
  });

  if (!user) {
    return { sent: true as const };
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const resetUrl = `${host}/tr/auth/reset-password?token=${token}`;

  if (process.env.NODE_ENV === 'development') {
    logger.info('Password reset link generated', { resetUrl, email: user.email });
  }

  return { sent: true as const, resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined };
}

export async function resetPasswordWithToken(
  token: string,
  newPasswordHash: string
) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date() || !record.user) {
    return { success: false as const, error: 'Invalid or expired token' };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { hashedPassword: newPasswordHash },
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  return { success: true as const };
}
