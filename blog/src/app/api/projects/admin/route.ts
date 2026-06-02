import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/auth-roles';
import { getAdminProjects } from '@/lib/data/projects';
import { mapProjectToDto } from '@/lib/project-mapper';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(2).max(2000),
  url: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const projects = await getAdminProjects();

    return NextResponse.json({ data: projects });
  } catch (error) {
    logger.error('Failed to fetch admin projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { title, description, url, image, sortOrder, published } = parsed.data;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        url: url || null,
        image: image || null,
        sortOrder: sortOrder ?? 0,
        published: published ?? false,
      },
    });

    return NextResponse.json({ data: mapProjectToDto(project) }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create project', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
