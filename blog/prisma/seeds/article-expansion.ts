import type { BlogCoverKey } from './blog-covers';
import type { EducationalArticleDef, TutorialChapter } from './content-builder';
import { productionNotes } from './long-article';

/** Tek birincil kategori — filtrede 2–5 makale görünür */
export const PRIMARY_CATEGORY: Record<BlogCoverKey, string> = {
  typescript: 'Web Geliştirme',
  nextjs: 'Web Geliştirme',
  a11y: 'Web Geliştirme',
  serverActions: 'Web Geliştirme',
  i18n: 'Web Geliştirme',
  prisma: 'Veritabanı',
  postgresql: 'Veritabanı',
  dbMigrations: 'Veritabanı',
  restApi: 'Backend',
  redis: 'Backend',
  graphql: 'Backend',
  eventDriven: 'Yazılım Mimarisi',
  docker: 'DevOps',
  cicd: 'DevOps',
  opentelemetry: 'DevOps',
  kubernetes: 'DevOps',
  featureFlags: 'DevOps',
  microservices: 'Yazılım Mimarisi',
  ddd: 'Yazılım Mimarisi',
  solid: 'Yazılım Mimarisi',
  nextauth: 'Güvenlik',
  webSecurity: 'Güvenlik',
  apiSecurity: 'Güvenlik',
  testing: 'Kalite ve Test',
  gitWorkflow: 'Kalite ve Test',
  contractTesting: 'Kalite ve Test',
  ai: 'Web Geliştirme',
};

const EXTRA_CHAPTERS: Partial<Record<BlogCoverKey, TutorialChapter[]>> = {
  typescript: [
    {
      title: 'Bölüm 5: Monorepo ve paylaşılan tipler',
      intro:
        'Birden fazla paket (web, api, shared) kullanıyorsanız tiplerin tek kaynaktan gelmesi şart. <code>packages/schemas</code> içinde Zod + export type pattern en az bakım maliyetli yoldur.',
      paragraphs: [
        'Turborepo veya pnpm workspace ile <code>@repo/schemas</code> paketini hem Next.js hem worker servislerine bağlayın. Circular dependency oluşursa domain tiplerini UI bileşenlerinden ayırın.',
        'CI\'da paketler arası <code>tsc --build</code> veya proje referansları (<code>composite: true</code>) ile kırık import\'ları erken yakalayın.',
      ],
      steps: [
        'Paylaşılan Zod şemalarını ayrı pakete taşıyın.',
        'Client-only kodu <code>"use client"</code> dosyalarına izole edin; şema paketi saf TypeScript kalsın.',
        'Versiyonlama: breaking schema değişikliğinde API ve UI\'ı aynı release train\'de deploy edin.',
      ],
      code: `// packages/schemas/src/blog.ts
import { z } from 'zod';
export const blogIdSchema = z.string().uuid();
export type BlogId = z.infer<typeof blogIdSchema>;`,
    },
    {
      title: 'Bölüm 6: Production gözlem ve tip regresyonu',
      intro: 'Runtime\'da tip hatası görülmez; fakat yanlış mapping veya serialize hataları log\'da belirir.',
      paragraphs: productionNotes('TypeScript/Zod'),
      list: {
        type: 'ul',
        items: [
          'Sentry veya benzeri araçta <code>ZodError</code> issues alanını tagleyin',
          'OpenAPI diff ile contract kırılımını PR\'da yakalayın',
          'Strict mod açıkken legacy <code>any</code> sayısını metrik olarak takip edin',
        ],
      },
    },
  ],
  nextjs: [
    {
      title: 'Bölüm 5: Partial Prerendering ve dinamik bölgeler',
      intro:
        'Next.js 15+ ile statik kabuk + dinamik delikler (PPR) birleşebilir. Blog listesi gibi sayfalarda hero statik, filtre/search dinamik tutulabilir.',
      paragraphs: [
        '<code>export const experimental_ppr = true</code> ve <code>Suspense</code> sınırları ile TTFB iyileşir. Dinamik segmentlerin cache politikası ayrı düşünülmeli.',
      ],
      steps: [
        'Sayfayı statik/dinamik parçalara ayırın.',
        'Dinamik parça için <code>loading.tsx</code> skeleton ekleyin.',
        'Lighthouse ile LCP ve INP ölçün.',
      ],
    },
    {
      title: 'Bölüm 6: Deploy ve ortam değişkenleri',
      intro: 'Server Component\'ler build zamanında bazı env\'leri gömer; runtime secret için dikkat.',
      paragraphs: productionNotes('Next.js App Router'),
      warning: '<code>NEXT_PUBLIC_</code> öneki olmayan secret\'ları asla client bundle\'a sızdırmayın.',
    },
  ],
  restApi: [
    {
      title: 'Bölüm 5: Versiyonlama ve deprecation',
      intro:
        'URL path versiyonu (<code>/api/v2/blogs</code>) veya Accept header ile contract evrimi yönetin. Breaking change öncesi <code>Sunset</code> header kullanın.',
      paragraphs: [
        'Eski istemciler için minimum 6 ay destek penceresi tanımlayın. OpenAPI changelog ile PR review bağlayın.',
      ],
      steps: [
        'v2 route namespace açın',
        'v1 için deprecation response header',
        'Metrik: v1 trafik oranı sıfıra yaklaşınca kapat',
      ],
    },
  ],
  docker: [
    {
      title: 'Bölüm 4: Supply chain ve imaj güvenliği',
      intro: 'Base image pin, distroless ve CVE taraması (Trivy, Grype) pipeline\'a eklenmeli.',
      paragraphs: productionNotes('Docker'),
      list: {
        type: 'ul',
        items: [
          'Non-root USER',
          'Read-only root filesystem mümkünse',
          'Secret\'ları env file yerine runtime inject',
        ],
      },
    },
  ],
  testing: [
    {
      title: 'Bölüm 4: Test verisi ve determinism',
      intro: 'Flaky E2E genelde zaman ve rastgele veriden kaynaklanır.',
      paragraphs: [
        'Factory ile seed kullanıcı; her test izole DB transaction veya truncate. Playwright <code>storageState</code> ile login tekrarını azaltın.',
      ],
      code: `// vitest.setup.ts — prisma transaction rollback pattern (özet)
beforeEach(async () => await prisma.$executeRaw\`BEGIN\`);
afterEach(async () => await prisma.$executeRaw\`ROLLBACK\`);`,
    },
  ],
  nextauth: [
    {
      title: 'Bölüm 4: Session fixation ve OAuth state',
      intro: 'OAuth callback\'te state parametresi CSRF içindir; asla atlamayın.',
      paragraphs: productionNotes('Auth.js'),
      warning: 'JWT secret rotation planı olmadan production\'a çıkmayın.',
    },
  ],
  microservices: [
    {
      title: 'Bölüm 4: Dağıtık gözlem ve SLO',
      intro: 'Servis sayısı arttıkça trace correlation şart; her servis aynı trace header\'ı propagate etmeli.',
      paragraphs: [
        'Servisler arası timeout (client < server) ve retry yalnızca idempotent işlemlerde. Circuit breaker ile cascade failure kesin.',
      ],
    },
  ],
  prisma: [
    {
      title: 'Bölüm 5: Read replica ve okuma/yazma ayrımı',
      intro: 'Yüksek okuma trafiğinde primary\'e rapor sorguları bindirmeyin.',
      paragraphs: [
        'Prisma ile birden fazla datasource veya middleware ile read replica yönlendirmesi yapılabilir. Tutarlılık gerektiren okumalar primary\'de kalmalı.',
      ],
      code: `// Örnek: ağır liste sorgusu replica'ya (pseudo)
const blogs = await prisma.$queryRaw\`
  SELECT id, title FROM "Blog" ORDER BY "createdAt" DESC LIMIT 20
\`;`,
    },
    {
      title: 'Bölüm 6: Yedekleme ve felaket kurtarma',
      intro: 'Migration doğru olsa bile yedeksiz PostgreSQL production riskidir.',
      paragraphs: productionNotes('Prisma/PostgreSQL'),
      list: {
        type: 'ol',
        items: [
          'Günlük otomatik snapshot + PITR',
          'Restore drill\'i çeyrekte bir kez',
          'Seed verisini production şemasından ayırın',
        ],
      },
    },
  ],
};

const DEFAULT_EXTRA: TutorialChapter[] = [
  {
    title: 'Derinlemesine: Senaryo çalışması',
    intro:
      'Gerçek bir ekip senaryosu: Cuma akşamı deploy sonrası hata oranı yükseldi. Aşağıdaki kontrol listesi ile kök nedeni daraltın.',
    paragraphs: [
      'Son deploy diff\'ine bakın: şema migration, env değişikliği, feature flag açılışı.',
      'Trace id ile tek bir başarısız isteği uçtan uca izleyin (edge → server → DB).',
      'Gerekirse kill switch veya önceki imaja rollback; veri migration geri alınamazsa kod rollback yeterli olmayabilir.',
    ],
    steps: [
      'Metrik panosunda hata oranı ve p95 latency',
      'Log\'da son 15 dakika exception grupları',
      'Son başarılı deploy tag\'ine dönüş kararı',
    ],
  },
  {
    title: 'Production checklist',
    intro: 'Canlıya çıkmadan önce bu maddeleri review edin.',
    paragraphs: productionNotes('üretim ortamı'),
    list: {
      type: 'ul',
      items: [
        'Rate limit ve timeout tanımlı',
        'Secret\'lar secret manager\'da',
        'Health check ve readiness probe çalışıyor',
        'Alarm eşikleri tanımlı (5xx, latency)',
      ],
    },
  },
];

export function finalizeArticle(def: EducationalArticleDef): EducationalArticleDef {
  const extra = EXTRA_CHAPTERS[def.coverKey] ?? DEFAULT_EXTRA;

  return {
    ...def,
    categories: [PRIMARY_CATEGORY[def.coverKey] ?? def.categories[0] ?? 'Web Geliştirme'],
    chapters: [...def.chapters, ...extra],
  };
}

export function finalizeArticles(defs: EducationalArticleDef[]): EducationalArticleDef[] {
  return defs.map(finalizeArticle);
}
