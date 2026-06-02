import { prisma } from '@/lib/prisma';
import { mapProjectToDto } from '@/lib/project-mapper';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({ data: projects.map(mapProjectToDto) });
  } catch (error) {
    logger.error('Failed to fetch projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
