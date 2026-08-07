/**
 * Mantıksal DB yedeğini hedef Postgres'e geri yükler.
 *
 * Kullanım (blog dizininden):
 *   yarn ts-node -P prisma/tsconfig.json scripts/restore-db-backup.ts path/to/db-backup-YYYY-MM-DD.json
 *
 * Önkoşul: hedef DB'de `yarn db:migrate:deploy` çalışmış olmalı (boş şema).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { DB_BACKUP_FORMAT_VERSION } from '../src/lib/db-backup/constants';

type BackupPayload = {
  version: number;
  createdAt: string;
  tables: Record<string, unknown[]>;
};

function getConnectionString() {
  return (
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.DATABASE_URL
  );
}

function requireTables(payload: BackupPayload, key: string): unknown[] {
  const rows = payload.tables[key];
  if (!Array.isArray(rows)) {
    throw new Error(`Backup missing table: ${key}`);
  }
  return rows;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error(
      'Usage: yarn ts-node -P prisma/tsconfig.json scripts/restore-db-backup.ts <backup.json>',
    );
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error(
      'Set POSTGRES_URL_NON_POOLING, POSTGRES_PRISMA_URL, or DATABASE_URL',
    );
  }

  const absolutePath = resolve(process.cwd(), inputPath);
  const payload = JSON.parse(
    readFileSync(absolutePath, 'utf8'),
  ) as BackupPayload;

  if (payload.version !== DB_BACKUP_FORMAT_VERSION) {
    throw new Error(
      `Unsupported backup version: ${String(payload.version)} (expected ${DB_BACKUP_FORMAT_VERSION})`,
    );
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const permissionRows = requireTables(payload, 'Permission');
    const accessRoleRows = requireTables(payload, 'AccessRole');
    const rolePermissionRows = requireTables(payload, 'RolePermission');
    const languageRows = requireTables(payload, 'Language');
    const userRows = requireTables(payload, 'User');
    const accountRows = requireTables(payload, 'Account');
    const passwordResetTokenRows = requireTables(payload, 'PasswordResetToken');
    const categoryRows = requireTables(payload, 'Category');
    const tagRows = requireTables(payload, 'Tag');
    const blogRows = requireTables(payload, 'Blog');
    const blogTranslationRows = requireTables(payload, 'BlogTranslation');
    const blogToCategoryRows = requireTables(payload, '_BlogToCategory');
    const blogToTagRows = requireTables(payload, '_BlogToTag');
    const projectRows = requireTables(payload, 'Project');
    const projectTranslationRows = requireTables(payload, 'ProjectTranslation');
    const commentRows = requireTables(payload, 'Comment') as Array<
      Record<string, unknown> & { id: string; commentId?: string | null }
    >;
    const commentReactionRows = requireTables(payload, 'CommentReaction');
    const siteResumeRows = requireTables(payload, 'SiteResume');
    const siteSnippetRows = requireTables(payload, 'SiteSnippet');
    const aiUsageLogRows = requireTables(payload, 'AiUsageLog');
    const webhookSourceRows = requireTables(payload, 'WebhookSource');
    const webhookEventRows = requireTables(payload, 'WebhookEvent');
    const siteAiSettingsRows = requireTables(payload, 'SiteAiSettings');

    await prisma.$transaction(async (tx) => {
      if (permissionRows.length > 0) {
        await tx.permission.createMany({
          data: permissionRows as never,
          skipDuplicates: true,
        });
      }
      if (accessRoleRows.length > 0) {
        await tx.accessRole.createMany({
          data: accessRoleRows as never,
          skipDuplicates: true,
        });
      }
      if (rolePermissionRows.length > 0) {
        await tx.rolePermission.createMany({
          data: rolePermissionRows as never,
          skipDuplicates: true,
        });
      }
      if (languageRows.length > 0) {
        await tx.language.createMany({
          data: languageRows as never,
          skipDuplicates: true,
        });
      }
      if (userRows.length > 0) {
        await tx.user.createMany({
          data: userRows as never,
          skipDuplicates: true,
        });
      }
      if (accountRows.length > 0) {
        await tx.account.createMany({
          data: accountRows as never,
          skipDuplicates: true,
        });
      }
      if (passwordResetTokenRows.length > 0) {
        await tx.passwordResetToken.createMany({
          data: passwordResetTokenRows as never,
          skipDuplicates: true,
        });
      }
      if (categoryRows.length > 0) {
        await tx.category.createMany({
          data: categoryRows as never,
          skipDuplicates: true,
        });
      }
      if (tagRows.length > 0) {
        await tx.tag.createMany({
          data: tagRows as never,
          skipDuplicates: true,
        });
      }
      if (blogRows.length > 0) {
        await tx.blog.createMany({
          data: blogRows as never,
          skipDuplicates: true,
        });
      }
      if (blogTranslationRows.length > 0) {
        await tx.blogTranslation.createMany({
          data: blogTranslationRows as never,
          skipDuplicates: true,
        });
      }

      for (const row of blogToCategoryRows as Array<{
        blogId: string;
        categoryId: string;
      }>) {
        await tx.$executeRaw`
          INSERT INTO "_BlogToCategory" ("A", "B")
          VALUES (${row.blogId}::uuid, ${row.categoryId}::uuid)
          ON CONFLICT DO NOTHING
        `;
      }

      for (const row of blogToTagRows as Array<{
        blogId: string;
        tagId: string;
      }>) {
        await tx.$executeRaw`
          INSERT INTO "_BlogToTag" ("A", "B")
          VALUES (${row.blogId}::uuid, ${row.tagId}::uuid)
          ON CONFLICT DO NOTHING
        `;
      }

      if (projectRows.length > 0) {
        await tx.project.createMany({
          data: projectRows as never,
          skipDuplicates: true,
        });
      }
      if (projectTranslationRows.length > 0) {
        await tx.projectTranslation.createMany({
          data: projectTranslationRows as never,
          skipDuplicates: true,
        });
      }

      const commentsWithoutParent = commentRows.map((row) => ({
        ...row,
        commentId: null,
      }));
      if (commentsWithoutParent.length > 0) {
        await tx.comment.createMany({
          data: commentsWithoutParent as never,
          skipDuplicates: true,
        });
      }

      for (const row of commentRows) {
        if (!row.commentId) continue;
        await tx.comment.update({
          where: { id: row.id },
          data: { commentId: row.commentId },
        });
      }

      if (commentReactionRows.length > 0) {
        await tx.commentReaction.createMany({
          data: commentReactionRows as never,
          skipDuplicates: true,
        });
      }
      if (siteResumeRows.length > 0) {
        await tx.siteResume.createMany({
          data: siteResumeRows as never,
          skipDuplicates: true,
        });
      }
      if (siteSnippetRows.length > 0) {
        await tx.siteSnippet.createMany({
          data: siteSnippetRows as never,
          skipDuplicates: true,
        });
      }
      if (aiUsageLogRows.length > 0) {
        await tx.aiUsageLog.createMany({
          data: aiUsageLogRows as never,
          skipDuplicates: true,
        });
      }
      if (webhookSourceRows.length > 0) {
        await tx.webhookSource.createMany({
          data: webhookSourceRows as never,
          skipDuplicates: true,
        });
      }
      if (webhookEventRows.length > 0) {
        await tx.webhookEvent.createMany({
          data: webhookEventRows as never,
          skipDuplicates: true,
        });
      }
      if (siteAiSettingsRows.length > 0) {
        await tx.siteAiSettings.createMany({
          data: siteAiSettingsRows as never,
          skipDuplicates: true,
        });
      }
    });

    process.stdout.write(
      `Restore completed from ${absolutePath} (createdAt=${payload.createdAt})\n`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`Restore failed: ${message}\n`);
  process.exitCode = 1;
});
