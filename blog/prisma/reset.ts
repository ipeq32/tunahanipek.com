import 'dotenv/config';
import { logger } from '../src/lib/logger';
import { prisma } from '../src/lib/prisma';

/**
 * Prisma'nın kendi migration geçmişini tutan tablo asla silinmemeli;
 * aksi halde `prisma migrate` durumu bozulur.
 */
const PROTECTED_TABLES = new Set<string>(['_prisma_migrations']);

interface PgTableRow {
  tablename: string;
}

function isResetConfirmed(): boolean {
  const hasForceFlag = process.argv.slice(2).includes('--force');
  const hasConfirmEnv = process.env.CONFIRM_DB_RESET === 'true';
  return hasForceFlag || hasConfirmEnv;
}

async function getPublicTables(): Promise<string[]> {
  const rows = await prisma.$queryRaw<PgTableRow[]>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `;

  return rows
    .map((row) => row.tablename)
    .filter((name) => !PROTECTED_TABLES.has(name));
}

async function truncateTables(tables: string[]): Promise<void> {
  const identifiers = tables.map((name) => `"public"."${name}"`).join(', ');

  // RESTART IDENTITY + CASCADE: tüm tabloları tek transaction içinde,
  // foreign key sırasından bağımsız olarak temizler.
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${identifiers} RESTART IDENTITY CASCADE;`,
  );
}

async function resetDatabase(): Promise<void> {
  if (!isResetConfirmed()) {
    logger.error(
      'Veritabanı sıfırlama iptal edildi: onay yok. "--force" bayrağını ' +
        'kullanın veya CONFIRM_DB_RESET=true ortam değişkenini ayarlayın.',
    );
    process.exitCode = 1;
    return;
  }

  const tables = await getPublicTables();

  if (tables.length === 0) {
    logger.warn('Sıfırlanacak kullanıcı tablosu bulunamadı.');
    return;
  }

  logger.warn('Veritabanı sıfırlanıyor.', {
    environment: process.env.NODE_ENV ?? 'unknown',
    tableCount: tables.length,
    tables,
  });

  await truncateTables(tables);

  logger.info('Veritabanı başarıyla sıfırlandı.', {
    tableCount: tables.length,
  });
}

resetDatabase()
  .catch((error: unknown) => {
    logger.error('Veritabanı sıfırlama sırasında hata oluştu.', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
