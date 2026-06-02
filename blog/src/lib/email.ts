import { logger } from '@/lib/logger';

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!resendKey || !from) {
    if (process.env.NODE_ENV === 'development') {
      logger.info('Email not sent (configure RESEND_API_KEY and EMAIL_FROM)', {
        to,
        subject,
      });
    }
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text: text ?? html.replace(/<[^>]+>/g, ''),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error('Resend API error', { status: response.status, body });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to send email', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
