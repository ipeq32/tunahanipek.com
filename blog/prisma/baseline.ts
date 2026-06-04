import 'dotenv/config';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../src/lib/logger';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function isBaselineConfirmed(): boolean {
  const hasForceFlag = process.argv.slice(2).includes('--force');
  const hasConfirmEnv = process.env.CONFIRM_DB_BASELINE === 'true';
  return hasForceFlag || hasConfirmEnv;
}

function hasDatabaseUrl(): boolean {
  return Boolean(
    process.env.POSTGRES_URL_NON_POOLING ??
      process.env.POSTGRES_PRISMA_URL ??
      process.env.DATABASE_URL,
  );
}

function listMigrationFolders(): string[] {
  return fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+_/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function baseline(): void {
  if (!hasDatabaseUrl()) {
    logger.error(
      'Veritabanı URL bulunamadı. POSTGRES_URL_NON_POOLING, POSTGRES_PRISMA_URL veya DATABASE_URL ayarlayın.',
    );
    process.exitCode = 1;
    return;
  }

  if (!isBaselineConfirmed()) {
    logger.error(
      'Baseline iptal edildi: onay yok. "--force" bayrağını kullanın veya CONFIRM_DB_BASELINE=true ayarlayın.',
    );
    process.exitCode = 1;
    return;
  }

  const migrations = listMigrationFolders();
  if (migrations.length === 0) {
    logger.warn('İşaretlenecek migration klasörü bulunamadı.');
    return;
  }

  logger.warn(
    'Mevcut migration dosyaları veritabanında "uygulandı" olarak işaretlenecek. ' +
      'Şema bu migration\'larla uyumlu olmalıdır (db push ile oluşturulmuş üretim DB).',
    { count: migrations.length, migrations },
  );

  for (const name of migrations) {
    logger.info('Migration işaretleniyor.', { migration: name });
    execSync(`npx prisma migrate resolve --applied "${name}"`, {
      stdio: 'inherit',
      env: process.env,
    });
  }

  logger.info('Baseline tamamlandı. Bundan sonra `yarn db:migrate:deploy` kullanın.');
}

try {
  baseline();
} catch (error: unknown) {
  logger.error('Baseline sırasında hata oluştu.', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
}
