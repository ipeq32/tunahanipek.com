import type { EducationalArticleDef } from '../../content-builder';

export const tutorialsPart2: EducationalArticleDef[] = [
  {
    title: 'Docker ve Docker Compose: Geliştirmeden Production\'a',
    photoId: '1605743520719-b8d638b704ba',
    tags: ['docker', 'compose', 'devops', 'container'],
    categories: ['DevOps', 'Altyapı'],
    stackNote: 'Docker 27+, Docker Compose v2, Node.js 22 alpine, PostgreSQL 16',
    prerequisites: [
      'Terminal kullanımı',
      'Temel ağ (port, volume) kavramı',
      'Next.js uygulamasını local çalıştırma deneyimi',
    ],
    objectives: [
      'Multi-stage Dockerfile ile küçük production image üretmek',
      'Compose ile local full-stack ortam kurmak',
      'Healthcheck ve non-root user ile güvenliği artırmak',
      'CI pipeline\'da image build ve scan otomatikleştirmek',
    ],
    summaryIntro:
      'Container, "benim makinemde çalışıyor" tartışmasını ortadan kaldırır. Ancak Dockerfile yanlış yazıldığında image şişer, güvenlik açığı ve yavaş deploy süreçleri oluşur.',
    summaryHook:
      'Next.js + PostgreSQL stack\'i için adım adım Dockerfile ve compose dosyası yazıp production hardening uygulayacağız.',
    chapters: [
      {
        title: 'Bölüm 1: Multi-stage Dockerfile',
        intro:
          'Build bağımlılıkları runtime image\'a girmemeli. İki aşama: deps + build, sonra yalnızca standalone output.',
        steps: [
          'deps stage: yarn install --frozen-lockfile',
          'builder: next build (standalone output etkin)',
          'runner: non-root user, yalnızca .next/standalone kopyala',
        ],
        code: `FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/.next/standalone ./
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
        tip: 'next.config output: "standalone" production image boyutunu ciddi düşürür.',
      },
      {
        title: 'Bölüm 2: Docker Compose local stack',
        intro:
          'Tek komutla app + postgres. Volume ile veri kalıcılığı; network ile servis izolasyonu.',
        code: `services:
  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
  app:
    build: .
    depends_on:
      db:
        condition: service_healthy
    environment:
      POSTGRES_PRISMA_URL: postgresql://postgres:postgres@db:5432/postgres`,
        steps: [
          'compose.yml oluşturun.',
          '<code>docker compose up --build</code> ile ayağa kaldırın.',
          'Migration\'ı entrypoint veya ayrı init job ile çalıştırın.',
        ],
      },
      {
        title: 'Bölüm 3: Production checklist',
        intro:
          'Registry\'ye push öncesi: Trivy scan, secret env, read-only filesystem, resource limit.',
        warning: '.env dosyasını image layer\'ına COPY etmeyin — build-time ARG ile de olsa risklidir.',
      },
    ],
    commonMistakes: [
      'Root user ile container çalıştırmak',
      'latest tag ile production deploy',
      'Healthcheck olmadan depends_on kullanmak',
    ],
    exercises: [
      'Local compose ile prisma migrate ve seed çalıştırın',
      'Image boyutunu multi-stage öncesi/sonrası karşılaştırın',
    ],
    nextSteps: ['GitHub Actions ile build-push pipeline kurun', 'Kubernetes öğreticisine geçin'],
  },
  {
    title: 'GitHub Actions ile CI/CD: Test, Build ve Deploy',
    photoId: '1618477247221-94724831379e',
    tags: ['github-actions', 'ci-cd', 'otomasyon', 'devops'],
    categories: ['DevOps', 'Kalite'],
    stackNote: 'GitHub Actions, Node 22, Yarn, Vitest 4, Playwright 1.60, ESLint 10',
    prerequisites: [
      'Git branch ve PR akışı',
      'package.json script\'leri (lint, test, build)',
      'GitHub repository admin erişimi',
    ],
    objectives: [
      'PR\'da lint + unit test pipeline kurmak',
      'Cache ile workflow süresini kısaltmak',
      'Branch protection ve required checks tanımlamak',
      'Staging deploy için environment secret kullanmak',
    ],
    summaryIntro:
      'Manuel deploy insan hatasına açıktır. CI/CD her commit\'te aynı kalite kapılarından geçer; yeşil pipeline olmadan main\'e kod girmez.',
    summaryHook:
      'Bu projedeki script\'lere uygun gerçek bir workflow.yml yazıp açıklayacağız.',
    chapters: [
      {
        title: 'Bölüm 1: Temel workflow',
        intro:
          'on: pull_request ve push main. Paralel job: lint, test. build job needs ile sonra.',
        code: `name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn lint
      - run: yarn test`,
        steps: [
          '.github/workflows/ci.yml oluşturun.',
          'Repository Settings → Branch protection → required checks ekleyin.',
          'İlk kırmızı build\'i bilinçli inceleyin; gürültüyü azaltın.',
        ],
      },
      {
        title: 'Bölüm 2: E2E ve cache',
        intro:
          'Playwright browser cache ve yarn cache dakikalar kazandırır. E2E nightly veya merge queue\'da çalışabilir.',
        tip: 'Flaky test\'e retry değil, kök neden analizi uygulayın.',
      },
      {
        title: 'Bölüm 3: Deploy gate',
        intro:
          'Production deploy environment protection ile sadece maintainer onayı. Secret rotation dokümante edin.',
      },
    ],
    commonMistakes: [
      'Lockfile commit etmeden cache kullanmak',
      'Secret\'ları log\'a basmak',
      'Test olmadan deploy',
    ],
    exercises: [
      'PR açıp CI\'ın çalıştığını doğrulayın',
      'Kasıtlı lint hatası ile pipeline\'ın kırıldığını görün',
    ],
    nextSteps: ['Preview deploy (Vercel/Docker) ekleyin', 'Deployment notification (Slack) bağlayın'],
  },
  {
    title: 'Test Piramidi: Vitest, Entegrasyon ve Playwright E2E',
    photoId: '1461749280684-dccba630e2f6',
    tags: ['testing', 'vitest', 'playwright', 'kalite'],
    categories: ['Kalite', 'Programlama'],
    stackNote: 'Vitest 4.x, Playwright 1.60+, Testing Library, Prisma test DB',
    prerequisites: [
      'TypeScript ve async test yazımı',
      'Temel DOM ve React render kavramı',
      'CI ortamında test çalıştırma',
    ],
    objectives: [
      'Unit test ile saf fonksiyon ve mapper\'ları doğrulamak',
      'Integration test ile Prisma + DB katmanını test etmek',
      'E2E ile kritik kullanıcı yolculuklarını korumak',
      'Flaky test\'leri izole etmek',
    ],
    summaryIntro:
      'Test piramidi: çok hızlı unit, orta integration, az sayıda e2e. Ters piramit (sadece manuel QA) scale etmez.',
    summaryHook:
      'sanitizeHtml, blog mapper ve public blog sayfası üzerinden üç katmanlı test stratejisi kuruyoruz.',
    chapters: [
      {
        title: 'Bölüm 1: Unit test (Vitest)',
        intro:
          'Saf fonksiyonlar, Zod şemaları, mapper\'lar. Mock minimum; logic gerçek kalsın.',
        code: `import { describe, it, expect } from 'vitest';
import { parseTagNames } from '@/lib/blog-taxonomy';

describe('parseTagNames', () => {
  it('lowercases and dedupes', () => {
    expect(parseTagNames('React, typescript, React')).toEqual(['react', 'typescript']);
  });
});`,
        steps: [
          'Vitest config ile @ path alias eşleştirin.',
          'Her public util için en az bir happy + edge case yazın.',
          'Coverage hedefini %100 değil, kritik path olarak belirleyin.',
        ],
      },
      {
        title: 'Bölüm 2: Integration test',
        intro:
          'Test DB (docker postgres veya schema per run). Gerçek Prisma client; mock repository değil.',
        warning: 'Testler birbirini etkilemesin; transaction rollback veya truncate stratejisi seçin.',
      },
      {
        title: 'Bölüm 3: Playwright E2E',
        intro:
          'Login → blog listesi → detay gibi 3-5 kritik flow. Page object pattern ile selector\'ları merkezileştirin.',
        steps: [
          'e2e/public-pages.spec.ts benzeri spec genişletin.',
          'CI\'da headless chromium kullanın.',
          'Screenshot on failure ile debug süresini kısaltın.',
        ],
      },
    ],
    commonMistakes: [
      'Implementation detail assert (internal state)',
      'Her şeyi e2e ile test etmek',
      'CI\'da paralel DB çakışması',
    ],
    exercises: [
      'Yeni bir Zod şeması için validation testleri yazın',
      'Blog arama filtresi için bir e2e senaryosu ekleyin',
    ],
    nextSteps: ['Contract test (API schema)', 'Visual regression (opsiyonel)'],
  },
  {
    title: 'Redis Önbellekleme: Cache-Aside, TTL ve Invalidation',
    photoId: '1551288049-bebda4e38f71',
    tags: ['redis', 'cache', 'performans', 'backend'],
    categories: ['Backend', 'Performans'],
    stackNote: 'Redis 7.x, Node ioredis, Next.js cache/revalidateTag',
    prerequisites: [
      'HTTP ve veritabanı latency kavramı',
      'Temel key-value düşüncesi',
      'REST veya Server Component data fetching',
    ],
    objectives: [
      'Cache-aside pattern uygulamak',
      'TTL ve stampede önleme stratejisi seçmek',
      'Yazı güncellendiğinde tutarlı invalidation yapmak',
      'Redis\'i session store olarak değerlendirmek',
    ],
    summaryIntro:
      'Önbellek, okuma yoğun sistemlerde DB yükünü ve p95 latency\'yi düşürür. Yanlış invalidation ise kullanıcıya eski veri gösterir — daha kötü bir UX.',
    summaryHook:
      'Blog listesi ve detay için Redis katmanı ekleyip Next.js revalidateTag ile birlikte çalıştırmayı öğreneceksiniz.',
    chapters: [
      {
        title: 'Bölüm 1: Cache-aside akışı',
        intro:
          '1) Cache\'e bak 2) Miss ise DB 3) Cache\'e yaz 4) Döndür. Uygulama cache\'i sahiplenir.',
        code: `async function getBlogList() {
  const cached = await redis.get('blog:list');
  if (cached) return JSON.parse(cached);
  const data = await getPublishedBlogs({});
  await redis.setex('blog:list', 300, JSON.stringify(data));
  return data;
}`,
        steps: [
          'Redis bağlantısını singleton modülde yönetin.',
          'Key isimlendirme convention: <code>blog:list</code>, <code>blog:{id}</code>.',
          'TTL\'i içerik türüne göre ayarlayın (liste kısa, detay orta).',
        ],
      },
      {
        title: 'Bölüm 2: Invalidation',
        intro:
          'Blog publish/unpublish/delete sonrası ilgili key\'leri silin. Tag invalidation ile Next.js page cache\'i de senkronize edin.',
        list: {
          type: 'ul',
          items: [
            'Single blog: DEL blog:{id} + revalidatePath',
            'Liste: DEL blog:list',
            'Toplu: SCAN + pattern (dikkatli, production\'da KEYS kullanmayın)',
          ],
        },
      },
      {
        title: 'Bölüm 3: Stampede koruması',
        intro:
          'Hot key expire anında yüzlerce istek DB\'ye gidebilir. Mutex veya probabilistic early refresh uygulayın.',
      },
    ],
    commonMistakes: [
      'TTL olmadan cache büyümesi',
      'Invalidate etmeyi unutmak',
      'Hassas kullanıcı verisini paylaşımlı key\'de tutmak',
    ],
    exercises: [
      'Blog listesine 5 dk cache ekleyin; publish sonrası temizlendiğini doğrulayın',
      'Cache hit oranını metric olarak loglayın',
    ],
    nextSteps: ['Redis Cluster dokümantasyonu', 'CDN edge cache katmanı'],
  },
  {
    title: 'PostgreSQL Performans: Index, EXPLAIN ve Pool Tuning',
    photoId: '1544383835-96da6f4a0b0a',
    tags: ['postgresql', 'sql', 'performans', 'veritabani'],
    categories: ['Veritabanı', 'Performans'],
    stackNote: 'PostgreSQL 16+, Prisma 7, PgBouncer, EXPLAIN ANALYZE',
    prerequisites: [
      'SQL SELECT ve JOIN',
      'Prisma findMany / where kullanımı',
      'Latency ve throughput kavramı',
    ],
    objectives: [
      'Yavaş sorguyu EXPLAIN ANALYZE ile teşhis etmek',
      'Doğru index türünü seçmek',
      'Connection pool ayarını ölçekle uyumlu yapmak',
      'Vacuum ve istatistik bakımını planlamak',
    ],
    summaryIntro:
      'ORM sorguyu üretir; planı veritabanı çizer. Index olmadan milyon satırda filtreleme kaçınılmaz olarak yavaştır.',
    summaryHook:
      'Blog tablosu üzerinde gerçekçi filtrelerle index ekleyip plan değişimini gözlemleyeceğiz.',
    chapters: [
      {
        title: 'Bölüm 1: EXPLAIN okuma',
        intro:
          'Seq Scan büyük tabloda alarm. Index Scan, Bitmap Heap Scan, cost ve rows tahmini yorumlanmalı.',
        code: `EXPLAIN ANALYZE
SELECT * FROM "Blog"
WHERE published = true AND "deletedAt" IS NULL
ORDER BY "createdAt" DESC
LIMIT 20;`,
        steps: [
          'Development\'ta sorguyu EXPLAIN ile çalıştırın.',
          'Prisma query log ile üretilen SQL\'i karşılaştırın.',
          'Farklı filtre kombinasyonlarını deneyin.',
        ],
      },
      {
        title: 'Bölüm 2: Index tasarımı',
        intro:
          'Composite index sırası: eşitlik filtresi önce, ardından sıralama kolonu. Partial index: <code>WHERE published = true</code>.',
        code: `@@index([published, createdAt])
@@index([authorId])`,
        tip: 'Her kolona index eklemek yazmayı yavaşlatır; ölçerek ekleyin.',
      },
      {
        title: 'Bölüm 3: Connection pool',
        intro:
          'Serverless\'te her istek yeni connection açmak felakettir. PgBouncer transaction mode + Prisma pool limit.',
        warning: 'max_connections aşımı tüm uygulamayı düşürür; monitoring şart.',
      },
    ],
    commonMistakes: [
      'LIKE \'%term%\' ile index beklemek',
      'Offset pagination ile derin sayfalama',
      'ANALYZE çalıştırmadan plan sapması',
    ],
    exercises: [
      'published + createdAt index öncesi/sonrası EXPLAIN kaydedin',
      'Cursor pagination taslağı yazın',
    ],
    nextSteps: ['Read replica routing', 'pg_stat_statements ile top query analizi'],
  },
];
