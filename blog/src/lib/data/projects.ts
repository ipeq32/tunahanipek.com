import { prisma } from '@/lib/prisma';
import { mapProjectToDto } from '@/lib/project-mapper';

export async function getPublishedProjects() {
  const projects = await prisma.project.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  return projects.map(mapProjectToDto);
}
