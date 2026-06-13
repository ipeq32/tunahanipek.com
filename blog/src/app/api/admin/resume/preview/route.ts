import { NextResponse } from 'next/server';
import { requireSuperAdminSession } from '@/lib/admin/require-super-admin';
import { getSiteResume } from '@/lib/site-resume';
import { isAllowedResumePdfUrl } from '@/lib/resume-preview-url';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await requireSuperAdminSession();
  if (!session) {
    return new NextResponse(null, { status: 403 });
  }

  const urlParam = new URL(request.url).searchParams.get('url');
  let targetUrl: string;

  if (urlParam) {
    if (!isAllowedResumePdfUrl(urlParam)) {
      return new NextResponse(null, { status: 400 });
    }
    targetUrl = urlParam;
  } else {
    const resume = await getSiteResume();
    if (!resume) {
      return new NextResponse(null, { status: 404 });
    }
    targetUrl = resume.url;
  }

  try {
    const upstream = await fetch(targetUrl, { cache: 'no-store' });

    if (!upstream.ok) {
      return new NextResponse(null, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/pdf';
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType.includes('pdf')
          ? contentType
          : 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    logger.error('Failed to proxy resume preview', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return new NextResponse(null, { status: 502 });
  }
}
