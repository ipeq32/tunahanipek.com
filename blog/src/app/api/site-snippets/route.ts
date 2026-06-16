import { NextResponse } from 'next/server';

import { locales } from '@/config';
import { logger } from '@/lib/logger';
import { getSiteSnippetLines } from '@/lib/site-snippets';
import { siteSnippetTypeSchema } from '@/lib/validations/site-snippets';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeResult = siteSnippetTypeSchema.safeParse(searchParams.get('type'));
    const locale = searchParams.get('locale')?.trim();

    if (
      !typeResult.success ||
      !locale ||
      !(locales as readonly string[]).includes(locale)
    ) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const lines = await getSiteSnippetLines(locale, typeResult.data);
    return NextResponse.json({ data: lines });
  } catch (error) {
    logger.error('Failed to fetch public site snippets', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
