import { getActiveLanguages } from '@/lib/languages';
import { getStaticLanguageFallback } from '@/lib/language-fallback';
import { TAXONOMY_CACHE_HEADERS } from '@/lib/api-cache';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET() {
  try {
    const languages = await getActiveLanguages();

    return NextResponse.json(
      { data: languages },
      { status: 200, headers: TAXONOMY_CACHE_HEADERS },
    );
  } catch (error) {
    logger.error('Failed to fetch languages', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { data: getStaticLanguageFallback() },
      { status: 200, headers: TAXONOMY_CACHE_HEADERS },
    );
  }
}
