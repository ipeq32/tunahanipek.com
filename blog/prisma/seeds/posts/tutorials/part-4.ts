import { createLongArticle, productionNotes } from '../../long-article';
import type { EducationalArticleDef } from '../../content-builder';

export const tutorialsPart4: EducationalArticleDef[] = [
  createLongArticle({
    title: 'Next.js Server Actions: Form, Mutation ve Güvenli Veri Yazımı',
    coverKey: 'serverActions',
    category: 'Web Geliştirme',
    tags: ['nextjs', 'server-actions', 'mutation', 'form'],
    stackNote: 'Next.js 16 App Router, React 19, Zod, Prisma 7',
    prerequisites: [
      'Server vs Client Component ayrımı',
      'HTTP POST ve HTML form temelleri',
      'Zod ile validation',
    ],
    objectives: [
      'Server Action ile tip güvenli mutation yazmak',
      'useActionState / useFormStatus ile form UX kurmak',
      'CSRF ve yetkilendirme kontrollerini action içine almak',
      'revalidatePath ve cache invalidation stratejisi seçmek',
    ],
    summaryIntro:
      'Server Actions, 2026 itibarıyla Next.js projelerinde REST endpoint açmadan mutation yapmanın birincil yoludur. Ancak “sadece async function” sanılmamalı; validation, auth ve idempotency aynı action içinde net olmalıdır.',
    summaryHook:
      'Blog yorumu ve içerik güncelleme senaryosu üzerinden güvenli action, optimistic UI alternatifi ve hata sınıflandırmasını adım adım kuracağız.',
    sections: [
      {
        title: 'Mental model: Action bir API endpoint gibidir',
        intro:
          'Her <code>"use server"</code> fonksiyonu ağa açık bir yüzeydir. Client Component\'ten çağrılsa bile sunucuda çalışır; bu yüzden session kontrolü ve input validation zorunludur.',
        paragraphs: [
          'Action\'lar RSC payload içinde serialize edilir; public action\'larda hassas bilgi döndürmeyin. Hata mesajlarını kullanıcı dostu, log\'ları ise ayrıntılı tutun.',
          'Birden fazla mutation için tek dev action yerine küçük, isimlendirilmiş action\'lar (createComment, deleteComment) tercih edin — audit ve test kolaylaşır.',
        ],
        code: `"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { commentSchema } from "@/lib/schemas/comment";

export async function createComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Unauthorized" };
  }

  const parsed = commentSchema.safeParse({
    blogId: formData.get("blogId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input", issues: parsed.error.flatten() };
  }

  await prisma.comment.create({
    data: { ...parsed.data, authorId: session.user.id },
  });
  revalidatePath(\`/blog/\${parsed.data.blogId}\`);
  return { ok: true as const };
}`,
      },
      {
        title: 'Form entegrasyonu ve progressive enhancement',
        intro:
          'JavaScript kapalı olsa bile form gönderimi çalışmalıdır. Server Action\'ı doğrudan <code>action</code> prop\'una bağlamak bu prensibi destekler.',
        paragraphs: [
          '<code>useActionState</code> ile önceki state (hata, başarı) form altında gösterilir. Loading için <code>useFormStatus</code> nested button gerektirir.',
        ],
        steps: [
          'Server Component sayfada formu render edin; action import edin.',
          'Client wrapper yalnızca pending UI için kullanın.',
          'Başarılı submit sonrası focus yönetimi ve live region ile screen reader bilgilendirin.',
        ],
        code2: `// CommentForm.tsx — "use client"
"use client";
import { useActionState } from "react";
import { createComment } from "./actions";

export function CommentForm({ blogId }: { blogId: string }) {
  const [state, action, pending] = useActionState(createComment, null);
  return (
    <form action={action}>
      <input type="hidden" name="blogId" value={blogId} />
      <textarea name="body" required minLength={3} />
      <button disabled={pending}>{pending ? "Gönderiliyor…" : "Yorum ekle"}</button>
      {state?.ok === false && <p role="alert">{state.error}</p>}
    </form>
  );
}`,
      },
      {
        title: 'Yetkilendirme ve idempotency',
        intro: 'Aynı form iki kez gönderildiğinde çift kayıt oluşmaması için strateji seçin.',
        paragraphs: [
          'Kritik işlemlerde (ödeme, yayınlama) idempotency key veya DB unique constraint kullanın.',
          'Action içinde resource ownership kontrolü yapın: kullanıcı yalnızca kendi yorumunu silebilmeli.',
        ],
        warning: 'Action\'da yalnızca cookie session\'a güvenmeyin; blogId için varlık ve yetki kontrolü ekleyin.',
      },
      {
        title: 'Cache ve revalidation',
        intro: 'Mutation sonrası hangi path\'lerin invalidate edileceği performansı doğrudan etkiler.',
        paragraphs: productionNotes('Server Actions'),
        list: {
          type: 'ul',
          items: [
            'revalidatePath — belirli route',
            'revalidateTag — etiketli fetch cache',
            'Gereksiz global revalidate\'dan kaçının',
          ],
        },
      },
    ],
    commonMistakes: [
      'Validation\'ı atlayıp FormData\'yı doğrudan Prisma\'ya vermek',
      'Hassas stack trace\'i client\'a döndürmek',
      'Her action\'da tüm siteyi revalidate etmek',
    ],
    exercises: [
      'Mevcut bir forma Server Action ekleyin ve Zod ile doğrulayın',
      'Yetkisiz kullanıcı ile delete action\'ını test edin',
      'pending state için erişilebilir loading metni ekleyin',
    ],
    nextSteps: [
      'next-intl ile çok dilli form hata mesajları',
      'Rate limit middleware ile action koruması',
    ],
  }),
  createLongArticle({
    title: 'next-intl ile Çok Dilli Next.js: Routing, Mesajlar ve SEO',
    coverKey: 'i18n',
    category: 'Web Geliştirme',
    tags: ['next-intl', 'i18n', 'locale', 'seo'],
    stackNote: 'Next.js 16, next-intl 4.x, App Router [locale] segment',
    prerequisites: ['App Router', 'Temel SEO (hreflang, canonical)'],
    objectives: [
      '[locale] segment yapısını kurmak',
      'Sunucu ve istemci bileşenlerinde çeviri kullanmak',
      'Tarih ve relativeTime için useNow pattern',
      'hreflang ve metadata çevirisi',
    ],
    summaryIntro:
      'Uluslararası blog veya SaaS ürününde dil yalnızca JSON dosyası değildir; URL yapısı, tarih formatı, SEO ve fallback davranışı birlikte tasarlanmalıdır.',
    summaryHook:
      'Türkçe/İngilizce blog senaryosunda routing, messages klasörü ve BlogCard relativeTime örneğini production seviyesinde ele alıyoruz.',
    sections: [
      {
        title: 'Locale routing ve middleware',
        intro: 'Kullanıcı dilini URL\'den, cookie\'den veya Accept-Language\'den türetin; tek kaynak seçin.',
        paragraphs: [
          '<code>middleware.ts</code> ile <code>/tr/blog</code> ve <code>/en/blog</code> yönlendirmesi standarttır. Default locale için prefix politikası (always / as-needed) SEO\'yu etkiler.',
        ],
        steps: [
          'next-intl middleware oluşturun',
          'app/[locale]/layout.tsx ile provider sarmalayın',
          'Geçersiz locale için notFound()',
        ],
        code: `// middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };`,
      },
      {
        title: 'Mesaj dosyaları ve namespace',
        intro: 'messages/tr.json ve messages/en.json paralel anahtar yapısında olmalı.',
        paragraphs: [
          'Blog, Nav, Auth gibi namespace\'ler merge conflict\'i azaltır. Eksik anahtar için build-time kontrol (strict mode) önerilir.',
        ],
        code2: `// BlogCard.tsx — relativeTime
"use client";
import { useNow, useFormatter } from "next-intl";

export function BlogCard({ date }: { date: Date }) {
  const now = useNow({ updateInterval: 60_000 });
  const format = useFormatter();
  return <time>{format.relativeTime(date, now)}</time>;
}`,
      },
      {
        title: 'SEO: alternate links ve canonical',
        intro: 'Aynı içeriğin iki dilde duplicate content sayılmaması için hreflang şart.',
        paragraphs: productionNotes('next-intl'),
      },
    ],
    commonMistakes: [
      'Client\'ta hard-coded Türkçe string bırakmak',
      'relativeTime için useNow kullanmamak (ENVIRONMENT_FALLBACK)',
      'Locale prefix tutarsızlığı',
    ],
    exercises: [
      'Yeni bir sayfa için tr/en mesaj ekleyin',
      'generateMetadata ile locale başlık üretin',
    ],
    nextSteps: ['RTL dil desteği', 'Çeviri CMS entegrasyonu'],
  }),
  createLongArticle({
    title: 'GraphQL API: Şema Tasarımı, N+1 ve Next.js Entegrasyonu',
    coverKey: 'graphql',
    category: 'Backend',
    tags: ['graphql', 'api', 'dataloader', 'apollo'],
    stackNote: 'GraphQL Yoga veya Apollo Server 4, Pothos/TypeGraphQL, Prisma',
    prerequisites: ['REST API deneyimi', 'SQL JOIN kavramı'],
    objectives: [
      'Şema-first vs code-first seçimi yapmak',
      'N+1 için DataLoader kullanmak',
      'Mutation ve input validation',
      'GraphQL güvenlik (depth limit, complexity)',
    ],
    summaryIntro:
      'GraphQL, istemcinin ihtiyacı kadar veri çekmesini sağlar; fakat kötü şema ve sınırsız derinlik sorguları sunucuyu kolayca düşürür.',
    summaryHook:
      'Blog–yazar–yorum graph\'ı üzerinden şema, resolver katmanı ve production limitlerini örnekliyoruz.',
    sections: [
      {
        title: 'Şema tasarımı ve pagination',
        intro: 'Cursor-based pagination (Relay spec) büyük listelerde offset\'ten üstündür.',
        paragraphs: [
          '<code>BlogConnection</code> / <code>edges</code> / <code>pageInfo</code> pattern ölçeklenebilir listeleme sağlar.',
        ],
        code: `type Query {
  blogs(first: Int = 20, after: String): BlogConnection!
}

type BlogConnection {
  edges: [BlogEdge!]!
  pageInfo: PageInfo!
}`,
        steps: [
          'Node interface ve global ID (opsiyonel)',
          'Filtre argümanlarını input type ile gruplayın',
          'Public şemada internal alanları expose etmeyin',
        ],
      },
      {
        title: 'DataLoader ve Prisma',
        intro: 'Her yorum için ayrı author sorgusu N+1 üretir; request başına DataLoader batch eder.',
        code: `import DataLoader from "dataloader";

const authorLoader = new DataLoader(async (ids: readonly string[]) => {
  const authors = await prisma.user.findMany({ where: { id: { in: [...ids] } } });
  const map = new Map(authors.map((a) => [a.id, a]));
  return ids.map((id) => map.get(id) ?? null);
});`,
      },
      {
        title: 'Güvenlik ve operasyon',
        intro: 'Query depth limit, complexity score ve persisted queries production için kritiktir.',
        paragraphs: productionNotes('GraphQL'),
      },
    ],
    commonMistakes: ['Sınırsız nested query', 'Resolver içinde ham Prisma without select', 'Auth kontrolünü unutmak'],
    exercises: ['Basit blog query yazın', 'DataLoader ile author batch ölçün'],
    nextSteps: ['Federation', 'REST ile GraphQL yan yana'],
  }),
  createLongArticle({
    title: 'PostgreSQL Migration Stratejileri: Zero-Downtime ve Geri Alma',
    coverKey: 'dbMigrations',
    category: 'Veritabanı',
    tags: ['postgresql', 'migration', 'prisma', 'zero-downtime'],
    stackNote: 'PostgreSQL 16, Prisma Migrate, expand-contract pattern',
    prerequisites: ['Prisma şema', 'SQL ALTER TABLE'],
    objectives: [
      'Expand-contract deploy sırasını uygulamak',
      'Geriye dönük uyumlu migration yazmak',
      'Büyük tablo için concurrent index',
      'Rollback planı oluşturmak',
    ],
    summaryIntro:
      'Canlı trafik altında kolon silmek veya tip değiştirmek tek adımlı migration ile felakete yol açabilir. Expand-contract, değişikliği iki–üç deploy\'a böler.',
    summaryHook:
      'Blog tablosuna yeni zorunlu alan ekleme ve eski kolon kaldırma senaryosunu zero-downtime ile anlatıyoruz.',
    sections: [
      {
        title: 'Expand-contract pattern',
        intro: 'Önce ekle (expand), sonra kodu geçir (migrate), en son sil (contract).',
        paragraphs: [
          'Deploy 1: nullable yeni kolon. Deploy 2: uygulama yeni kolonu yazar. Deploy 3: NOT NULL + default. Deploy 4: eski kolon drop.',
        ],
        steps: [
          'Migration PR\'ı küçük tutun',
          'Her adımda geri alınabilir kod yolu bırakın',
          'Veri backfill script\'i idempotent olsun',
        ],
      },
      {
        title: 'Prisma migrate ve shadow DB',
        intro: 'CI\'da migrate diff ve shadow database ile kırık migration erken yakalanır.',
        code: `# Üretim öncesi
npx prisma migrate deploy
npx prisma migrate status`,
      },
      {
        title: 'Büyük tablo ve lock',
        intro: '<code>CREATE INDEX CONCURRENTLY</code> production lock süresini azaltır.',
        paragraphs: productionNotes('PostgreSQL migration'),
        warning: 'Transaction içinde CONCURRENTLY kullanılamaz; ayrı migration dosyası açın.',
      },
    ],
    commonMistakes: ['Tek deploy\'da NOT NULL + drop', 'Backfill olmadan constraint', 'Restore testi yapmamak'],
    exercises: ['Nullable → required geçiş planı yazın', 'Rollback SQL hazırlayın'],
    nextSteps: ['Blue-green DB', 'Read replica lag gözlemi'],
  }),
  createLongArticle({
    title: 'API Güvenliği: OAuth2 Scope, Rate Limit ve OWASP API Top 10',
    coverKey: 'apiSecurity',
    category: 'Güvenlik',
    tags: ['api-security', 'oauth', 'rate-limit', 'owasp'],
    stackNote: 'Next.js Route Handlers, Auth.js, Redis rate limit',
    prerequisites: ['REST/GraphQL', 'HTTP status kodları'],
    objectives: [
      'BOLA/IDOR risklerini kapatmak',
      'Rate limit ve API key rotation',
      'Scope tabanlı yetkilendirme',
      'Audit log ve anomaly detection',
    ],
    summaryIntro:
      '2023 OWASP API Security Top 10, mobil ve SPA backend\'lerinde hâlâ geçerlidir. Object level authorization en sık atlanan maddedir.',
    summaryHook:
      'Blog API\'sinde kullanıcının başkasının kaynağına erişimini engelleme ve brute-force korumasını kodlayacağız.',
    sections: [
      {
        title: 'BOLA ve resource ownership',
        intro: 'Her <code>GET /api/blogs/:id</code> isteğinde sahiplik veya public flag kontrol edin.',
        code: `export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const blog = await prisma.blog.findUnique({ where: { id: params.id } });
  if (!blog || blog.authorId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.blog.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return Response.json({ ok: true });
}`,
      },
      {
        title: 'Rate limiting',
        intro: 'IP + user id composite key ile sliding window Redis limit uygulayın.',
        steps: ['@upstash/ratelimit veya custom Lua', '429 + Retry-After header', 'Auth endpoint\'te daha sıkı limit'],
      },
      {
        title: 'Audit ve secret yönetimi',
        intro: 'API key\'leri log\'lamayın; rotation takvimi oluşturun.',
        paragraphs: productionNotes('API güvenliği'),
      },
    ],
    commonMistakes: ['UUID ile security through obscurity', 'Admin endpoint\'te aynı auth', 'Verbose error body'],
    exercises: ['IDOR test case yazın', 'Rate limit integration test'],
    nextSteps: ['mTLS servisler arası', 'WAF kuralları'],
  }),
  createLongArticle({
    title: 'Contract Testing ve API Regresyonu: Pact ve OpenAPI Diff',
    coverKey: 'contractTesting',
    category: 'Kalite ve Test',
    tags: ['contract-test', 'pact', 'openapi', 'vitest'],
    stackNote: 'Vitest, Pact JS, OpenAPI 3.1, CI GitHub Actions',
    prerequisites: ['Unit test', 'REST API'],
    objectives: [
      'Consumer-driven contract test yazmak',
      'OpenAPI spec\'i CI gate yapmak',
      'Breaking change tespiti',
      'Mock vs contract farkını anlamak',
    ],
    summaryIntro:
      'Entegrasyon testleri yavaş ve kırılgan olabilir; contract test, tüketici beklentisini üreticiye bağlar ve deploy güvenini artırır.',
    summaryHook:
      'Blog listesi API\'si için Pact consumer ve provider verification pipeline kuruyoruz.',
    sections: [
      {
        title: 'Consumer contract',
        intro: 'Frontend veya BFF, beklediği JSON şeklini tanımlar; provider bunu doğrular.',
        code: `import { PactV3 } from "@pact-foundation/pact";

const provider = new PactV3({ consumer: "BlogWeb", provider: "BlogApi" });

it("blog listesi", async () => {
  await provider
    .given("blogs exist")
    .uponReceiving("GET /api/blogs")
    .willRespondWith({ status: 200, body: { items: eachLike({ id: uuid(), title: string() }) } });
});`,
      },
      {
        title: 'OpenAPI diff gate',
        intro: 'PR\'da spec değişikliği breaking ise build fail.',
        steps: ['openapi-diff veya oasdiff CLI', 'Semantic versioning policy', 'Deprecation header'],
      },
      {
        title: 'Ne zaman contract, ne zaman E2E',
        intro: 'Contract hızlı geri bildirim; E2E kritik user journey için.',
        paragraphs: productionNotes('contract testing'),
      },
    ],
    commonMistakes: ['Contract olmadan sadece snapshot', 'Provider verify atlanması', 'Spec güncel değil'],
    exercises: ['Tek endpoint için Pact yazın', 'Breaking diff örneği üretin'],
    nextSteps: ['Schema registry (events)', 'GraphQL schema check'],
  }),
  createLongArticle({
    title: 'Domain-Driven Design: Bounded Context ve Modüler Monolit',
    coverKey: 'ddd',
    category: 'Yazılım Mimarisi',
    tags: ['ddd', 'bounded-context', 'modular-monolith'],
    stackNote: 'TypeScript monorepo, event bus (opsiyonel), Prisma modül başına schema',
    prerequisites: ['Temel mimari', 'REST veya mesajlaşma'],
    objectives: [
      'Ubiquitous language ve context map çizmek',
      'Modül sınırlarında public API tanımlamak',
      'Anti-corruption layer kullanmak',
      'Mikroservise erken bölmeden kaçınmak',
    ],
    summaryIntro:
      'DDD, kod organizasyonundan önce iş dilini hizalar. Blog platformunda "Yayın", "Moderasyon" ve "Billing" ayrı context olabilir.',
    summaryHook:
      'Tek repo modüler monolit içinde context sınırları ve event ile gevşek bağlantı kuruyoruz.',
    sections: [
      {
        title: 'Context map',
        intro: 'Upstream/downstream ilişkileri ve entegrasyon tipi (ACL, shared kernel) belirlenir.',
        list: {
          type: 'ul',
          items: [
            'Publishing — core domain',
            'Comments — supporting',
            'Analytics — generic',
          ],
        },
      },
      {
        title: 'Modül yapısı',
        intro: 'src/modules/publishing, src/modules/comments — cross-import yasak, sadece public index.',
        code: `// modules/comments/public.ts — dışarıya açık yüzey
export { createComment } from "./application/create-comment";`,
        steps: ['ESLint boundaries rule', 'Domain event interface', 'Integration test modül sınırında'],
      },
      {
        title: 'Mikroservise geçiş kriteri',
        intro: 'Ekip ve deploy bağımsızlığı, farklı ölçek ihtiyacı ve fault isolation olgunlaşınca düşünün.',
        paragraphs: productionNotes('DDD'),
      },
    ],
    commonMistakes: ['Her entity için ayrı servis', 'Shared DB anti-pattern', 'Anemic domain model'],
    exercises: ['Context map çizin', 'Bir modül için public API listesi'],
    nextSteps: ['Event storming workshop', 'CQRS okuma modeli'],
  }),
];
