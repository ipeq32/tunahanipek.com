import 'server-only';

import { prisma } from '@/lib/prisma';
import { DB_BACKUP_FORMAT_VERSION } from '@/lib/db-backup/constants';

type JoinRow = {
  A: string;
  B: string;
};

function jsonSafeReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

/**
 * FK güvenli sırayla tüm tabloları (ve implicit M2M join’leri) export eder.
 */
export async function exportDatabaseSnapshot(): Promise<{
  payload: Record<string, unknown>;
  json: string;
  rowCounts: Record<string, number>;
}> {
  const [
    permissions,
    accessRoles,
    rolePermissions,
    languages,
    users,
    accounts,
    passwordResetTokens,
    categories,
    tags,
    blogs,
    blogTranslations,
    blogToCategory,
    blogToTag,
    projects,
    projectTranslations,
    comments,
    commentReactions,
    siteResume,
    siteSnippets,
    aiUsageLogs,
    webhookSources,
    webhookEvents,
    siteAiSettings,
  ] = await Promise.all([
    prisma.permission.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.accessRole.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.rolePermission.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.language.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.account.findMany({ orderBy: { id: 'asc' } }),
    prisma.passwordResetToken.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.category.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.tag.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.blog.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.blogTranslation.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.$queryRaw<JoinRow[]>`SELECT "A", "B" FROM "_BlogToCategory"`,
    prisma.$queryRaw<JoinRow[]>`SELECT "A", "B" FROM "_BlogToTag"`,
    prisma.project.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.projectTranslation.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.comment.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.commentReaction.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.siteResume.findMany(),
    prisma.siteSnippet.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.aiUsageLog.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.webhookSource.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.webhookEvent.findMany({ orderBy: { receivedAt: 'asc' } }),
    prisma.siteAiSettings.findMany(),
  ]);

  const tables = {
    Permission: permissions,
    AccessRole: accessRoles,
    RolePermission: rolePermissions,
    Language: languages,
    User: users,
    Account: accounts,
    PasswordResetToken: passwordResetTokens,
    Category: categories,
    Tag: tags,
    Blog: blogs,
    BlogTranslation: blogTranslations,
    _BlogToCategory: blogToCategory.map((row) => ({
      blogId: row.A,
      categoryId: row.B,
    })),
    _BlogToTag: blogToTag.map((row) => ({
      blogId: row.A,
      tagId: row.B,
    })),
    Project: projects,
    ProjectTranslation: projectTranslations,
    Comment: comments,
    CommentReaction: commentReactions,
    SiteResume: siteResume,
    SiteSnippet: siteSnippets,
    AiUsageLog: aiUsageLogs,
    WebhookSource: webhookSources,
    WebhookEvent: webhookEvents,
    SiteAiSettings: siteAiSettings,
  } as const;

  const rowCounts = Object.fromEntries(
    Object.entries(tables).map(([name, rows]) => [name, rows.length]),
  );

  const payload = {
    version: DB_BACKUP_FORMAT_VERSION,
    createdAt: new Date().toISOString(),
    tables,
  };

  const json = JSON.stringify(payload, jsonSafeReplacer);

  return { payload, json, rowCounts };
}
