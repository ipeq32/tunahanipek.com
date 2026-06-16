import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function getConnectionString() {
  return (
    process.env.POSTGRES_PRISMA_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    'postgresql://postgres:postgres@localhost:5432/postgres?schema=public'
  );
}

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: getConnectionString() });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as typeof globalThis & {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
};

function getPrismaClient() {
  const cached = globalForPrisma.prismaGlobal;

  if (process.env.NODE_ENV === 'production') {
    return cached ?? prismaClientSingleton();
  }

  // Dev: schema değişince (migrate + generate) eski singleton yeni modelleri içermez.
  if (cached && 'aiUsageLog' in cached) {
    return cached;
  }

  const client = prismaClientSingleton();
  globalForPrisma.prismaGlobal = client;
  return client;
}

export const prisma = getPrismaClient();
