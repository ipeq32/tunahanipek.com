import { NextResponse } from 'next/server';

import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import { logger } from '@/lib/logger';
import { parsePaginationFromRequest } from '@/lib/pagination';
import {
  getAllSiteSnippetsForAdmin,
  getSiteSnippetsForAdmin,
  repairSiteSnippets,
  replaceSiteSnippets,
} from '@/lib/site-snippets';
import {
  replaceSiteSnippetsSchema,
  siteSnippetTypeSchema,
} from '@/lib/validations/site-snippets';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const context = await requirePermission(PERMISSIONS['site-copy:read']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const typeResult = siteSnippetTypeSchema.safeParse(searchParams.get('type'));
    const locale = searchParams.get('locale')?.trim();

    if (!typeResult.success || !locale) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const fetchAll =
      searchParams.get('all') === '1' || searchParams.get('all') === 'true';

    if (fetchAll) {
      await repairSiteSnippets();
      const items = await getAllSiteSnippetsForAdmin(locale, typeResult.data);

      return NextResponse.json({
        data: items,
        pagination: {
          page: 1,
          limit: 100,
          total: items.length,
          totalPages: 1,
        },
      });
    }

    const { page, limit } = parsePaginationFromRequest(request);
    const result = await getSiteSnippetsForAdmin(
      locale,
      typeResult.data,
      page,
      limit
    );

    return NextResponse.json({
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch site snippets', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const context = await requirePermission(PERMISSIONS['site-copy:update']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const parsed = replaceSiteSnippetsSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid payload' },
        { status: 400 }
      );
    }

    const data = await replaceSiteSnippets(parsed.data);
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Failed to save site snippets', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
