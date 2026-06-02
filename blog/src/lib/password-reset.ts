import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { host } from '@/config';
import { defaultLocale, locales } from '@/config';
import { sendEmail } from '@/lib/email';

const TOKEN_TTL_MS = 60 * 60 * 1000;

function resolveLocale(locale?: string) {
  if (locale && (locales as readonly string[]).includes(locale)) {
    return locale;
  }
  return defaultLocale;
}

export async function createPasswordResetToken(email: string, locale?: string) {
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

  const resolvedLocale = resolveLocale(locale);
  const resetUrl = `${host}/${resolvedLocale}/auth/reset-password?token=${token}`;

  const subject =
    resolvedLocale === 'tr'
      ? 'Şifre sıfırlama — Tunahan İPEK Blog'
      : 'Password reset — Tunahan İPEK Blog';

  const html =
    resolvedLocale === 'tr'
      ? `<p>Merhaba ${user.name},</p><p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın (1 saat geçerlidir):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>`
      : `<p>Hi ${user.name},</p><p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`;

  const emailed = await sendEmail({ to: user.email, subject, html });

  if (!emailed && process.env.NODE_ENV === 'development') {
    logger.info('Password reset link (email not configured)', {
      resetUrl,
      email: user.email,
    });
  }

  return {
    sent: true as const,
    resetUrl:
      process.env.NODE_ENV === 'development' && !emailed ? resetUrl : undefined,
  };
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
