import { NextResponse } from 'next/server';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import {
  getDecryptedAiConfig,
  isAiConfigured,
} from '@/lib/site-ai-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const context = await requirePermission(PERMISSIONS['ai:status']);
  if (!context) {
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
