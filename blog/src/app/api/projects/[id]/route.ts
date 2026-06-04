import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { mapProjectToDto } from '@/lib/project-mapper';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import {
  revalidateProjectDetail,
  revalidateProjectList,
} from '@/lib/revalidate-public';
import { sanitizeHtml } from '@/lib/sanitize';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().min(2).max(2000).optional(),
  url: z.string().url().optional().nullable(),
  image: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const existing = await prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const data = parsed.data;
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: sanitizeHtml(data.description),
        }),
        ...(data.url !== undefined && { url: data.url || null }),
        ...(data.image !== undefined && { image: data.image || null }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    revalidateProjectDetail(id);

    return NextResponse.json({ data: mapProjectToDto(project) });
  } catch (error) {
    logger.error('Failed to update project', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidateProjectList();
    revalidateProjectDetail(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete project', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
