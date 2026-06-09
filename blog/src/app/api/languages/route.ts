import { getActiveLanguages } from '@/lib/languages';
import { getStaticLanguageFallback } from '@/lib/language-fallback';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const languages = await getActiveLanguages();

    return NextResponse.json({ data: languages }, { status: 200 });
  } catch (error) {
    logger.error('Failed to fetch languages', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { data: getStaticLanguageFallback() },
      { status: 200 },
    );
  }
}
