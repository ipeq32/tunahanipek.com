import 'server-only';

import { prisma } from '@/lib/prisma';
import { deleteUploadedFiles } from '@/lib/uploadthing-server';

export const SITE_RESUME_ID = 'default';

export type SiteResumeRecord = {
  url: string;
  fileName: string;
  updatedAt: Date;
};

export async function getSiteResume(): Promise<SiteResumeRecord | null> {
  const row = await prisma.siteResume.findUnique({
    where: { id: SITE_RESUME_ID },
  });

  if (!row) {
    return null;
  }

  return {
    url: row.url,
    fileName: row.fileName,
    updatedAt: row.updatedAt,
  };
}

export async function upsertSiteResume(data: {
  url: string;
  fileName: string;
}): Promise<SiteResumeRecord> {
  const existing = await prisma.siteResume.findUnique({
    where: { id: SITE_RESUME_ID },
  });

  if (existing?.url && existing.url !== data.url) {
    await deleteUploadedFiles([existing.url]);
  }

  const row = await prisma.siteResume.upsert({
    where: { id: SITE_RESUME_ID },
    create: {
      id: SITE_RESUME_ID,
      url: data.url,
      fileName: data.fileName,
    },
    update: {
      url: data.url,
      fileName: data.fileName,
    },
  });

  return {
    url: row.url,
    fileName: row.fileName,
    updatedAt: row.updatedAt,
  };
}

export async function clearSiteResume(): Promise<void> {
  const existing = await prisma.siteResume.findUnique({
    where: { id: SITE_RESUME_ID },
  });

  if (!existing) {
    return;
  }

  await deleteUploadedFiles([existing.url]);
  await prisma.siteResume.delete({ where: { id: SITE_RESUME_ID } });
}
