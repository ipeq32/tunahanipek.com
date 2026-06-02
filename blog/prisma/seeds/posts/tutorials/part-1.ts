import type { EducationalArticleDef } from '../../content-builder';

export const tutorialsPart1: EducationalArticleDef[] = [
  {
    title: 'TypeScript 5.9+ ve Zod ile Tip Güvenli Full-Stack Geliştirme',
    photoId: '1516116216624-53e697fedbea',
    tags: ['typescript', 'zod', 'tip-guvenligi', 'full-stack'],
    categories: ['Web Geliştirme', 'Programlama'],
    stackNote: 'TypeScript 5.9+, Zod 3.x, Node.js 22 LTS, Next.js 16 App Router',
    prerequisites: [
      'Modern JavaScript (ES2022+) ve async/await',
      'Temel React ve Next.js App Router kavramları',
      'HTTP ve JSON API deneyimi',
    ],
    objectives: [
      'strict TypeScript yapılandırmasını bilinçli şekilde kurmak',
      'Zod ile runtime validation ve compile-time tipi tek kaynaktan üretmek',
      'Server Action ve API girişlerinde güvenli parse akışı tasarlamak',
      'Prisma modellerinden UI DTO\'larına tip güvenli mapping yapmak',
    ],
    summaryIntro:
      'TypeScript, 2026 itibarıyla ciddi full-stack projelerde varsayılan dil haline geldi. Ancak yalnızca <code>.ts</code> uzantısı kullanmak tip güvenliği sağlamaz; disiplinli şema, strict config ve runtime doğrulama birlikte gerekir.',
    summaryHook:
      'Bu öğreticide sıfırdan strict proje ayarı yapacak, Zod şemalarını Server Action\'lara bağlayacak ve production\'da gördüğümüz tip kaçaklarını kapatacaksınız.',
    chapters: [
      {
        title: 'Bölüm 1: strict modu doğru açmak',
        intro:
          'Çoğu ekip TypeScript\'i "yavaşlatıyor" sanır; asıl yavaşlatan, strict kapalıyken production\'da patlayan hatalardır. <code>tsconfig.json</code> dosyanız projenin sözleşmesidir.',
        paragraphs: [
          '<code>strict: true</code> altındaki <code>noUncheckedIndexedAccess</code> ve <code>exactOptionalPropertyTypes</code> seçenekleri başlangıçta zorlayıcıdır; fakat optional alanlarda yapılan hataları erken yakalar.',
          'Paylaşılan tipler için <code>@/types</code> veya domain bazlı <code>lib/schemas</code> klasörü kullanın; component içinde inline tip tanımı ölçeklenmez.',
        ],
        steps: [
          '<code>tsconfig.json</code> içinde <code>"strict": true</code> ve <code>"skipLibCheck": true</code> ayarlayın.',
          'Yeni dosyalarda <code>any</code> yasaklayın; ESLint <code>@typescript-eslint/no-explicit-any</code> kuralını error seviyesine alın.',
          'Mevcut legacy modülleri tek PR\'da değil; modül modül strict\'e taşıyın.',
        ],
        code: `// tsconfig.json — önerilen çekirdek
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "target": "ES2017"
  }
}`,
        tip: 'CI pipeline\'da <code>tsc --noEmit</code> çalıştırın; yalnızca IDE uyarısına güvenmeyin.',
      },
      {
        title: 'Bölüm 2: Zod ile tek kaynak prensibi',
        intro:
          'Derleme zamanı tipleri build sonrası kaybolur. API body, form ve query parametreleri runtime\'da validate edilmelidir. Zod bu iki dünyayı <code>z.infer</code> ile birleştirir.',
        paragraphs: [
          'Şemayı bir kez yazarsınız; hem parse hem tip üretirsiniz. Hata mesajlarını <code>.safeParse()</code> ile kullanıcı dostu formata çevirmek form UX\'inin parçasıdır.',
        ],
        steps: [
          '<code>lib/schemas/blog.ts</code> altında blog create şeması tanımlayın.',
          'Server Action\'da <code>safeParse</code> kullanın; başarısızlıkta field-level hata dönün.',
          'Client tarafında aynı şemayı react-hook-form resolver ile paylaşın (<code>@hookform/resolvers/zod</code>).',
        ],
        code: `import { z } from 'zod';

export const blogCreateSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(17),
  tags: z.string().optional(),
});

export type BlogCreateInput = z.infer<typeof blogCreateSchema>;

export function parseBlogCreate(data: unknown) {
  return blogCreateSchema.safeParse(data);
}`,
        warning:
          'Zod şemasını client bundle\'a taşırken hassas business rule\'ları ayırın; sadece form için gereken alanları export edin.',
      },
      {
        title: 'Bölüm 3: Prisma ile uçtan uca tip zinciri',
        intro:
          'Prisma Client 7.x otomatik üretilen tiplerle çalışır. <code>include</code> ve <code>select</code> kullanımı dönüş tipini değiştirir; UI katmanına ham <code>Blog</code> modelini sızdırmayın.',
        paragraphs: [
          '<code>Prisma.BlogGetPayload&lt;{ include: { tags: true } }&gt;</code> ile liste kartı tipini tanımlayın. Mapper fonksiyonları bu tipi <code>IGetBlog</code> gibi UI contract\'ına dönüştürür.',
        ],
        steps: [
          'Veri erişimini <code>lib/data/blogs.ts</code> içinde toplayın.',
          'Route handler ince kalsın: validate → service → map → response.',
          'Optional relation\'lar için null-safe mapping yazın.',
        ],
        blockquote:
          'Tip zinciri: Zod input → Service → Prisma → Mapper → React props.',
      },
      {
        title: 'Bölüm 4: Discriminated union ile API yanıtları',
        intro:
          'Başarı ve hata yanıtlarını aynı union altında modellemek, client\'ta <code>if (result.ok)</code> daraltmasını güvenli kılar.',
        code: `type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: string };

async function createBlog(input: unknown): Promise<ApiResult<{ id: string }>> {
  const parsed = parseBlogCreate(input);
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed', code: 'VALIDATION' };
  }
  const blog = await prisma.blog.create({ data: parsed.data });
  return { ok: true, data: { id: blog.id } };
}`,
      },
    ],
    commonMistakes: [
      'strict kapalı bırakıp yalnızca IDE\'ye güvenmek',
      'Zod parse sonucunu kontrol etmeden Prisma\'ya geçmek',
      'Prisma modelini doğrudan Client Component prop\'u yapmak (serialize hatası)',
      'Generic\'leri gereksiz yere karmaşıklaştırıp okunabilirliği düşürmek',
    ],
    exercises: [
      'Mevcut bir form için Zod şeması yazın ve hem Server Action hem client resolver\'da kullanın',
      'Bir liste endpoint\'i için <code>select</code> ile dar payload tipi üretin',
      'Hatalı input ile API\'yi test edin; 422 gövdesinin alan bazlı olduğunu doğrulayın',
    ],
    nextSteps: [
      'Branded types (<code>type UserId = string & { __brand: "UserId" }</code>) ile ID karışıklığını önleyin',
      'OpenAPI veya tRPC ile contract\'ı ekip dışına dokümante edin',
      'Prisma ORM öğreticisine geçerek veri katmanını derinleştirin',
    ],
  },
  {
    title: 'Prisma 7 ve PostgreSQL: Üretim Kalitesinde Veri Katmanı',
    photoId: '1544383835-96da6f4a0b0a',
    tags: ['prisma', 'postgresql', 'orm', 'veritabani'],
    categories: ['Backend', 'Veritabanı'],
    stackNote: 'Prisma 7.8+, PostgreSQL 16+, PrismaPg adapter, Node.js 22',
    prerequisites: [
      'SQL temelleri (SELECT, JOIN, index kavramı)',
      'Docker ile local PostgreSQL veya managed DB erişimi',
      'TypeScript ve async/await',
    ],
    objectives: [
      'İlişkisel şemayı okuma pattern\'lerine göre tasarlamak',
      'Migration ve seed sürecini güvenli otomatikleştirmek',
      'N+1 problemini tespit edip çözmek',
      'Transaction ve soft delete ile tutarlı veri yönetmek',
    ],
    summaryIntro:
      'Prisma, şema-first yaklaşımıyla tip güvenli sorgular sunar. ORM kullanmak SQL bilgisini gereksiz kılmaz; aksine doğru index ve transaction bilgisi olmadan production\'da yavaşlama kaçınılmazdır.',
    summaryHook:
      'Blog–tag–comment ilişkileri üzerinden şema tasarımından production connection pool\'a kadar adım adım ilerleyeceğiz.',
    chapters: [
      {
        title: 'Bölüm 1: Şema tasarımı ve ilişkiler',
        intro:
          'Model çizmeden önce sorguları listeleyin: liste sayfası, detay, admin paneli, arama. Her ekran farklı <code>include</code> ihtiyacı doğurur.',
        paragraphs: [
          'Many-to-many için implicit join tablosu Prisma\'da <code>tags Tag[]</code> ile temsil edilir. Self-relation (comment reply) için <code>@relation("ReplyToComment")</code> adlandırması şarttır.',
          'UUID (<code>@db.Uuid</code>) dağıtık sistemlerde güvenlidir; sıralı ID isteyen raporlar için <code>createdAt</code> index\'i ekleyin.',
        ],
        code: `model Blog {
  id         String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  title      String
  published  Boolean   @default(false)
  deletedAt  DateTime? @db.Timestamptz(3)
  tags       Tag[]
  @@index([published, createdAt])
}`,
        steps: [
          '<code>schema.prisma</code> dosyasında modelleri ve index\'leri tanımlayın.',
          '<code>npx prisma migrate dev --name init_blog</code> ile migration üretin.',
          'Staging\'de asla <code>db push</code> ile migration atlamayın; drift oluşur.',
        ],
      },
      {
        title: 'Bölüm 2: Veri erişim katmanı',
        intro:
          'Route dosyalarında ham Prisma çağrısı kısa vadede hızlı, uzun vadede test edilemez yapı üretir. <code>lib/data/</code> katmanı standarttır.',
        steps: [
          '<code>getPublishedBlogs(filters)</code> tek sorumluluklu fonksiyon yazın.',
          'Filtreleri tip güvenli <code>BlogFilters</code> objesi ile alın.',
          'Soft delete için her public sorguda <code>deletedAt: null</code> şartını unutmayın.',
        ],
        code: `export async function getPublishedBlogs(filters: BlogFilters) {
  return prisma.blog.findMany({
    where: {
      published: true,
      deletedAt: null,
      ...(filters.tag && { tags: { some: { name: filters.tag } } }),
    },
    include: { tags: true, author: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take: filters.limit ?? 20,
  });
}`,
      },
      {
        title: 'Bölüm 3: N+1 ve performans',
        intro:
          'Liste sayfasında 20 blog + her biri için ayrı tag sorgusu = 21 round-trip. Prisma query log ile development\'ta bunu görün.',
        paragraphs: [
          '<code>include</code> ile eager load birincil çözümdür. Çok büyük listelerde cursor pagination ve selective <code>select</code> kullanın.',
        ],
        list: {
          type: 'ul',
          items: [
            'Development: <code>log: ["query", "warn"]</code>',
            'Production: yavaş sorgu eşiği ve structured log',
            'EXPLAIN ANALYZE ile DB tarafını doğrulayın',
          ],
        },
        tip: 'Prisma 7 driver adapter (<code>@prisma/adapter-pg</code>) serverless ve long-running Node için pool ayarını dokümante edin.',
      },
      {
        title: 'Bölüm 4: Transaction ve seed',
        intro:
          'Blog oluşturma + taxonomy sync tek transaction içinde olmalı. Yarım yazılmış kayıt kullanıcıya asla görünmemeli.',
        code: `await prisma.$transaction(async (tx) => {
  const blog = await tx.blog.create({ data: blogData });
  await syncTaxonomyWithClient(tx, blog.id, tags, categories);
});`,
        steps: [
          'Seed script\'lerini idempotent yazın (başlık veya slug ile kontrol).',
          'Seed içeriğini güncellediğinizde upsert veya update stratejisi belirleyin.',
          'Production credential\'larını seed\'e koymayın.',
        ],
      },
    ],
    commonMistakes: [
      'Migration yerine sürekli db push kullanmak',
      'Public API\'de soft-deleted kayıtları döndürmek',
      'Sınırsız connection açmak (PgBouncer olmadan scale)',
      'Index eklemeden milyon satırlı tabloda filtrelemek',
    ],
    exercises: [
      'Blog listesine kategori filtresi ekleyin ve explain ile sorguyu doğrulayın',
      'Yorum + reply oluşturmayı transaction ile sarın',
      'Seed\'i iki kez çalıştırın; duplicate oluşmadığını kontrol edin',
    ],
    nextSteps: [
      'Read replica veya connection pool (PgBouncer) dokümantasyonunu okuyun',
      'PostgreSQL performans öğreticisine geçin',
      'Prisma Accelerate veya cache katmanını değerlendirin',
    ],
  },
  {
    title: 'Next.js 16 App Router: Server Components Öğreticisi',
    photoId: '1555066931-4365d14bab8c',
    tags: ['next.js', 'react', 'server-components', 'app-router'],
    categories: ['Web Geliştirme', 'Yazılım Mimarisi'],
    stackNote: 'Next.js 16.2+, React 19.2+, next-intl 4.x',
    prerequisites: [
      'React temelleri (props, state, hooks)',
      'HTTP ve SSR kavramına aşinalık',
      'TypeScript strict mod',
    ],
    objectives: [
      'Server ve Client Component sınırını doğru çizmek',
      'Async Server Component ile veri getirmeyi öğrenmek',
      'Streaming, Suspense ve loading.tsx kullanmak',
      'Cache ve revalidation stratejisi seçmek',
    ],
    summaryIntro:
      'Next.js 16, React 19 ile birlikte Server Components\'i varsayılan model yapar. Bu, "use client her yere" alışkanlığının sona erdiği anlamına gelir.',
    summaryHook:
      'Gerçek bir blog listesi ve detay sayfası üzerinden Server-First akışı kuracağız; her adımda neden sunucuda kaldığımızı açıklayacağız.',
    chapters: [
      {
        title: 'Bölüm 1: Mental model',
        intro:
          'Server Component sunucuda çalışır, istemciye HTML (+ minimal RSC payload) gider. Client Component JavaScript bundle\'a girer. Varsayılan: sunucu.',
        paragraphs: [
          'Interaktivite (onClick, useState) → Client. Veritabanı, secret, ağır kütüphane → Server. Bu ayrım performans değil, mimari disiplindir.',
        ],
        list: {
          type: 'ol',
          items: [
            'Etkileşim var mı?',
            'Browser API gerekli mi?',
            'Hassas veri işleniyor mu?',
            'Hepsi hayır → Server Component',
          ],
        },
      },
      {
        title: 'Bölüm 2: Veri getirme',
        intro:
          'Pages Router\'daki getServerSideProps yerine async page component kullanılır. Veri kodu UI ile yan yana ama data katmanına delegate edilmelidir.',
        code: `// app/[locale]/(main)/blog/page.tsx
export default async function BlogPage() {
  const blogs = await getPublishedBlogs({ limit: 20 });
  return <BlogList blogs={blogs} />;
}`,
        steps: [
          '<code>lib/data/blogs.ts</code> fonksiyonunu yazın.',
          'Page\'i async yapın; await ile veriyi çekin.',
          'Liste için ayrı Client Component yalnızca arama/filtre gerekiyorsa ekleyin.',
        ],
      },
      {
        title: 'Bölüm 3: Streaming ve UX',
        intro:
          'Yavaş sorgu tüm sayfayı bloke etmemeli. <code>loading.tsx</code> route segmentine Suspense boundary ekler.',
        steps: [
          'Blog listesi için skeleton component tasarlayın.',
          'Ağır alt segmenti <code>&lt;Suspense fallback={...}&gt;</code> ile sarın.',
          'Core Web Vitals\'ta LCP ve INP\'yi ölçün.',
        ],
        tip: 'Layout\'ta ağır async iş yapmayın; alt route\'lara bölün.',
      },
      {
        title: 'Bölüm 4: Cache ve revalidate',
        intro:
          'Next.js 16\'da fetch cache davranışı bilinçli olarak explicit\'tir. Dinamik sayfalar için <code>cache: "no-store"</code> veya <code>dynamic = "force-dynamic"</code> kullanın.',
        paragraphs: [
          'Blog içeriği güncellendiğinde <code>revalidatePath("/blog")</code> veya tag ile hedefli invalidation yapın.',
        ],
        warning:
          'Development ve production cache farklıdır; yalnızca local hızına güvenerek strateji seçmeyin.',
      },
    ],
    commonMistakes: [
      'Tüm ağacı "use client" ile işaretlemek',
      'useEffect ile sunucuda yapılabilecek veriyi çekmek',
      'Server\'dan Client\'a fonksiyon veya class instance geçirmek',
    ],
    exercises: [
      'Bir sayfayı Server-only yapıp bundle analyzer ile farkı ölçün',
      'Blog detayına Suspense ile yorum listesi ekleyin',
      'Publish sonrası revalidatePath çağrısı ekleyin',
    ],
    nextSteps: [
      'Server Actions öğreticisi ile mutasyon katmanını öğrenin',
      'next-intl ile locale routing\'i derinleştirin',
      'Partial Prerendering dokümantasyonunu takip edin',
    ],
  },
  {
    title: 'NextAuth (Auth.js) v5 ile Güvenli Oturum Yönetimi',
    photoId: '1563013544-86ae1ad094d0',
    tags: ['nextauth', 'auth.js', 'oauth', 'guvenlik'],
    categories: ['Web Geliştirme', 'Güvenlik'],
    stackNote: 'next-auth 5.0 beta, Next.js 16 App Router, bcryptjs, Prisma adapter',
    prerequisites: [
      'HTTP cookie ve session kavramı',
      'Next.js middleware temelleri',
      'Prisma User modeli',
    ],
    objectives: [
      'Auth.js v5 yapılandırmasını App Router\'a entegre etmek',
      'Credential ve OAuth provider eklemek',
      'RBAC ile admin route korumak',
      'Session hardening uygulamak',
    ],
    summaryIntro:
      'Kimlik doğrulama, blog yorumlarından admin paneline kadar her hassas işlemin kapısıdır. Auth.js v5, Next.js App Router ile native entegre çalışacak şekilde yeniden tasarlandı.',
    summaryHook:
      'Credential login, role tabanlı yetkilendirme ve middleware korumasını bu projedeki pattern\'lerle uyumlu şekilde kurmayı öğreneceksiniz.',
    chapters: [
      {
        title: 'Bölüm 1: Auth yapılandırması',
        intro:
          '<code>auth.ts</code> merkez dosyadır. Providers, callbacks ve session stratejisi burada tanımlanır.',
        steps: [
          'Prisma adapter ile User modelini bağlayın.',
          'Credentials provider\'da bcrypt ile hash karşılaştırın.',
          'JWT veya database session stratejisini bilinçli seçin.',
        ],
        code: `export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
});`,
      },
      {
        title: 'Bölüm 2: Route koruma',
        intro:
          'Middleware ile <code>/admin</code> ve <code>/blog/add</code> rotalarını koruyun. Server Action içinde de session kontrolü tekrarlanmalıdır — middleware tek başına yetmez.',
        paragraphs: [
          '<code>isModerator(role)</code> helper\'ı merkezi tutun. UI\'da buton gizlemek güvenlik değildir; API ve action\'da da kontrol şart.',
        ],
        warning:
          'Server Action\'lar public endpoint gibidir; her action başında <code>auth()</code> çağırın.',
      },
      {
        title: 'Bölüm 3: Güvenlik checklist',
        intro:
          'Production öncesi mutlaka tamamlanması gereken maddeler:',
        list: {
          type: 'ul',
          items: [
            'HTTPS ve Secure cookie',
            'Login rate limiting',
            'Şifre sıfırlama token\'ı tek kullanımlık + TTL',
            'CSRF: framework varsayılanlarına güven ama custom form\'ları denetleyin',
            'OAuth state parametresi ve redirect URI whitelist',
          ],
        },
      },
    ],
    commonMistakes: [
      'Yalnızca client-side redirect ile admin korumak',
      'Role bilgisini client\'tan gelen body\'ye güvenmek',
      'Session ömrünü gereksiz uzatmak',
    ],
    exercises: [
      'Moderator olmayan kullanıcı ile blog add API\'sini 403 alacak şekilde test edin',
      'Session callback\'e role ekleyin ve profile sayfasında gösterin',
    ],
    nextSteps: [
      'Passkey / WebAuthn desteğini araştırın',
      'OWASP Authentication cheat sheet\'i okuyun',
    ],
  },
  {
    title: 'REST API Tasarımı ve Next.js Route Handlers',
    photoId: '1558494949-ef010cbdcc31',
    tags: ['rest', 'api', 'next.js', 'backend'],
    categories: ['Backend', 'API'],
    stackNote: 'Next.js 16 Route Handlers, Zod validation, Prisma 7',
    prerequisites: [
      'HTTP metodları ve status kodları',
      'JSON ve TypeScript',
      'Temel güvenlik (auth header, CORS)',
    ],
    objectives: [
      'Tutarlı REST kaynak modeli tasarlamak',
      'Pagination ve filtreleme contract\'ı tanımlamak',
      'Validation ve hata gövdesi standardı oluşturmak',
      'Rate limit ve auth middleware uygulamak',
    ],
    summaryIntro:
      'REST, 2026\'da hâlâ en yaygın API stilidir. GraphQL kadar esnek değildir; ancak öğrenmesi kolay, cache\'lenmesi doğal ve ekipler arası contract\'ı nettir.',
    summaryHook:
      'Blog API\'nizi referans alarak GET list/detail, POST create ve PATCH update için production kalitesinde handler yazacağız.',
    chapters: [
      {
        title: 'Bölüm 1: URL ve kaynak isimlendirme',
        intro:
          'İsimler çoğul: <code>/api/blog</code>, <code>/api/blog/[id]</code>. Fiil kullanmayın; HTTP metodu fiili taşır.',
        list: {
          type: 'ul',
          items: [
            'GET — okuma',
            'POST — oluşturma',
            'PATCH — kısmi güncelleme',
            'DELETE — soft delete tercih',
          ],
        },
      },
      {
        title: 'Bölüm 2: Handler iskeleti',
        intro:
          'Her handler: auth → validate → service → map → response. Try/catch ile structured log; kullanıcıya generic 500, log\'a detay.',
        code: `export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag') ?? undefined;
  const blogs = await getPublishedBlogs({ tag, limit: 20 });
  return NextResponse.json({ data: blogs.map(mapBlogToResponse) });
}`,
        steps: [
          'Query parametrelerini Zod ile parse edin.',
          'Başarılı yanıtta tutarlı <code>{ data }</code> veya <code>{ data, meta }</code> kullanın.',
          '201 Created sonrası Location header düşünün.',
        ],
      },
      {
        title: 'Bölüm 3: Pagination ve filtreleme',
        intro:
          'Offset pagination basit; büyük tablolarda cursor (<code>?cursor=uuid</code>) tercih edin. Meta alanında <code>hasMore</code> ve <code>nextCursor</code> döndürün.',
      },
      {
        title: 'Bölüm 4: Güvenlik',
        intro:
          'Rate limit, CORS whitelist, input sanitization. Admin endpoint\'lerde role kontrolü zorunlu.',
        warning: 'Hata mesajında stack trace veya SQL detayı asla dönmeyin.',
      },
    ],
    commonMistakes: [
      '200 OK ile hata gövdesi döndürmek',
      'Tutarsız JSON şekilleri (bazen array bazen object)',
      'Validation\'sız searchParams kullanımı',
    ],
    exercises: [
      'Blog listesine tag ve category query filtresi ekleyin',
      '422 validation response şemasını dokümante edin',
    ],
    nextSteps: [
      'OpenAPI (Swagger) spec üretin',
      'GraphQL öğreticisi ile alternatif API stilini karşılaştırın',
    ],
  },
];
