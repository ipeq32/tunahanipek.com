import 'server-only';

import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { deleteUploadedFiles } from '@/lib/uploadthing-server';

export const SITE_RESUME_ID = 'default';

export type SiteResumeRecord = {
  url: string;
  fileName: string;
  updatedAt: Date;
};

async function querySiteResume(): Promise<SiteResumeRecord | null> {
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

const getCachedSiteResume = unstable_cache(
  querySiteResume,
  ['site-resume'],
  { revalidate: 300, tags: ['site-resume'] },
);

export async function getSiteResume(): Promise<SiteResumeRecord | null> {
  return getCachedSiteResume();
}

export async function getSiteResumeDirect(): Promise<SiteResumeRecord | null> {
  return querySiteResume();
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

  revalidateTag('site-resume', { expire: 0 });

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
  revalidateTag('site-resume', { expire: 0 });
}
