import { attachDatabasePool } from '@vercel/functions';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

function getConnectionString() {
  return (
    process.env.POSTGRES_PRISMA_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    'postgresql://postgres:postgres@localhost:5432/postgres?schema=public'
  );
}

/**
 * Vercel (Fluid) + Prisma 7 `pg` adapter: her instance kendi havuzunu tutar.
 * Varsayılan max=10 bağlantı limitini kolayca tüketir; serverless'te düşük tut.
 * `attachDatabasePool` idle bağlantıları suspend öncesi kapatır.
 */
function createPool() {
  const pool = new Pool({
    connectionString: getConnectionString(),
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });

  if (process.env.VERCEL) {
    attachDatabasePool(pool);
  }

  return pool;
}

const prismaClientSingleton = () => {
  const pool = createPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as typeof globalThis & {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
};

function getPrismaClient() {
  if (!globalForPrisma.prismaGlobal) {
    globalForPrisma.prismaGlobal = prismaClientSingleton();
  }

  // Dev: schema değişince (migrate + generate) eski singleton yeni modelleri içermez.
  if (
    process.env.NODE_ENV !== 'production' &&
    !('aiUsageLog' in globalForPrisma.prismaGlobal)
  ) {
    globalForPrisma.prismaGlobal = prismaClientSingleton();
  }

  return globalForPrisma.prismaGlobal;
}

export const prisma = getPrismaClient();
