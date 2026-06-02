import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const datasourceUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node -P prisma/tsconfig.json prisma/seed.ts',
  },
  datasource: {
    url: datasourceUrl,
  },
});
