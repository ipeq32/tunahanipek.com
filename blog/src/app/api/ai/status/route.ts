import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isModerator } from '@/lib/auth-roles';
import {
  getDecryptedAiConfig,
  isAiConfigured,
} from '@/lib/site-ai-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user || !isModerator(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const config = await getDecryptedAiConfig();
  const available = Boolean(config && isAiConfigured(config));

  return NextResponse.json({
    data: {
      available,
      autoTranslateOnSave: config?.autoTranslateOnSave ?? false,
    },
  });
}
