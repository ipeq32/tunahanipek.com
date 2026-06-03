import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const CONTACT_INBOX = 'hello@tunahanipek.com';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`contact:ip:${ip}`, 5, 60 * 60 * 1000);

  if (!ipLimit.allowed) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const { name, email, message } = parsed.data;
    const emailLimit = checkRateLimit(
      `contact:email:${email.toLowerCase()}`,
      3,
      60 * 60 * 1000,
    );

    if (!emailLimit.allowed) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }

    const escapedName = name.replace(/[<>&]/g, '');
    const escapedMessage = message.replace(/[<>&]/g, '');

    const sent = await sendEmail({
      to: CONTACT_INBOX,
      subject: `Contact form: ${escapedName}`,
      html: `
        <p><strong>Name:</strong> ${escapedName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${escapedMessage.replace(/\n/g, '<br>')}</p>
      `,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    if (!sent) {
      return NextResponse.json(
        { message: 'Email service unavailable' },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: 'Message sent' });
  } catch (error) {
    logger.error('Contact form failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
