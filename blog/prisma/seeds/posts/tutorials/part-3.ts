import type { EducationalArticleDef } from '../../content-builder';

export const tutorialsPart3: EducationalArticleDef[] = [
  {
    title: 'Mikroservis ve Modüler Monolit: Mimari Karar Rehberi',
    photoId: '1451187580459-43490279c0fa',
    tags: ['mikroservis', 'monolit', 'mimari', 'ddd'],
    categories: ['Yazılım Mimarisi'],
    stackNote: 'Domain-Driven Design, event-driven messaging, Kubernetes (opsiyonel)',
    prerequisites: [
      'Monolit uygulama deploy deneyimi',
      'API ve veritabanı temelleri',
      'Ekip yapısı ve release süreci farkındalığı',
    ],
    objectives: [
      'Modüler monolit ile mikroservis farkını netleştirmek',
      'Bounded context çizmeyi öğrenmek',
      'Strangler fig ile güvenli geçiş planlamak',
      'Dağıtık sistem maliyetlerini listelemek',
    ],
    summaryIntro:
      'Mimari moda değil, risk yönetimidir. Büyük şirketlerin mikroservis hikâyeleri, olgun DevOps olmadan kopyalandığında felaketle biter.',
    summaryHook:
      'Blog platformunuzu örnek alarak ne zaman monolitte kalacağınızı, ne zaman servis ayıracağınızı ölçülebilir kriterlerle öğreneceksiniz.',
    chapters: [
      {
        title: 'Bölüm 1: Modüler monolit',
        intro:
          'Tek deploy birimi; kod içinde net modül sınırları (blog, auth, comment). Public API modüller arası sadece export edilen fonksiyonlar.',
        paragraphs: [
          'Next.js projesinde <code>lib/data</code>, <code>lib/services</code> ayrımı modüler monolitin küçük örneğidir. Circular dependency yasak.',
        ],
        steps: [
          'Domain klasör yapısını çizin.',
          'Cross-module import\'ları lint ile kısıtlayın.',
          'Transaction sınırını tek DB içinde tutun.',
        ],
      },
      {
        title: 'Bölüm 2: Ne zaman ayırmalı?',
        intro:
          'Bağımsız ölçek, bağımsız deploy, farklı teknoloji veya regülasyon alanı — net ihtiyaç yoksa ayırmayın.',
        list: {
          type: 'ul',
          items: [
            'Farklı TPS profili (ör. arama vs yazma)',
            'Farklı availability hedefi',
            'Ekip sınırı (Conway yasası)',
            'Compliance izolasyonu',
          ],
        },
        blockquote: 'Önce modül, sonra servis; önce ölçüm, sonra network boundary.',
      },
      {
        title: 'Bölüm 3: Strangler fig geçişi',
        intro:
          'Yorum moderasyonu ayrı servis olacaksa, önce API gateway arkasında yeni servisi çalıştırın; trafiği kademeli yönlendirin.',
        steps: [
          'Yeni servisin contract\'ını OpenAPI ile dondurun.',
          'Dual-write dönemini kısa tutun.',
          'Eski modülü feature flag ile kapatın.',
        ],
      },
    ],
    commonMistakes: [
      'Henüz product-market fit yokken mikroservis',
      'Dağıtık transaction\'ı sık kullanmak',
      'Observability olmadan split',
    ],
    exercises: [
      'Mevcut projede modül bağımlılık grafiği çıkarın',
      'Bir modül için "ayrılsaydı maliyet" tablosu yazın',
    ],
    nextSteps: ['Event-driven öğretici', 'Kubernetes deploy'],
  },
  {
    title: 'Event-Driven Mimari: Outbox, Saga ve Mesaj Kuyruğu',
    photoId: '1555949963-aa79dcee981c',
    tags: ['event-driven', 'kafka', 'mimari', 'async'],
    categories: ['Yazılım Mimarisi', 'Backend'],
    stackNote: 'Transactional outbox, Kafka/RabbitMQ kavramları, idempotent consumer',
    prerequisites: [
      'REST ve DB transaction bilgisi',
      'Async messaging temel kavramı',
      'En az bir monolit proje deneyimi',
    ],
    objectives: [
      'Event ve command ayrımını yapmak',
      'Outbox pattern ile güvenilir publish',
      'Saga ile dağıtık iş akışı yönetmek',
      'DLQ ve replay operasyonu tasarlamak',
    ],
    summaryIntro:
      'Kullanıcı blog yayınladığında e-posta, arama indeksi ve analytics güncellenmeli. Hepsini senkron HTTP zincirinde tutmak timeout ve coupling üretir.',
    summaryHook:
      'BlogPublished olayı üzerinden outbox tablosu ve idempotent consumer yazmayı adım adım göreceksiniz.',
    chapters: [
      {
        title: 'Bölüm 1: Olay modelleme',
        intro:
          'Event geçmiş zaman: BlogPublished, CommentApproved. Command emir: SendNewsletter. İsimlendirme past tense.',
        code: `{ "type": "BlogPublished", "payload": { "blogId": "...", "authorId": "..." }, "occurredAt": "2026-06-02T10:00:00Z" }`,
      },
      {
        title: 'Bölüm 2: Transactional outbox',
        intro:
          'DB commit ve mesaj publish atomik olmalı. Outbox tablosuna yaz → worker publish → işaretle.',
        steps: [
          'Outbox tablosu ekleyin.',
          'Blog create transaction içinde outbox row insert edin.',
          'Background worker ile Kafka/Rabbit\'a gönderin.',
        ],
        warning: 'En az bir kez delivery varsayın; consumer idempotent olmalı.',
      },
      {
        title: 'Bölüm 3: Saga ve DLQ',
        intro:
          'Çok adımlı iş: publish → index → notify. Her adım başarısızsa compensating action. DLQ\'ya düşen mesajlar manuel replay edilir.',
      },
    ],
    commonMistakes: [
      'Ordering garantisi olmadan varsayım yapmak',
      'Idempotency key olmadan consumer',
      'Event şemasını versiyonsuz bırakmak',
    ],
    exercises: [
      'Outbox worker için integration test yazın',
      'Aynı event\'i iki kez işleyince tek sonuç alındığını doğrulayın',
    ],
    nextSteps: ['CloudEvents spec', 'CQRS okuma modeli'],
  },
  {
    title: 'SOLID ve Temiz Kod: React/TypeScript Projelerinde Uygulama',
    photoId: '1504639728390-1319577231394',
    tags: ['solid', 'clean-code', 'refactoring', 'typescript'],
    categories: ['Programlama', 'Yazılım Mimarisi'],
    stackNote: 'TypeScript 5.9+, React 19, Next.js 16 component modeli',
    prerequisites: [
      'React component ve hook kullanımı',
      'TypeScript interface ve type',
      'Kod review deneyimi',
    ],
    objectives: [
      'Her SOLID prensibini somut örnekle anlamak',
      'God component\'i parçalamak',
      'Bağımlılığı interface ile ters çevirmek (gerektiğinde)',
      'Over-engineering\'den kaçınmak',
    ],
    summaryIntro:
      'SOLID dogma değil rehberdir. Amacınız değişime dirençli ama okunabilir kod üretmektir.',
    summaryHook:
      'BlogForm, taxonomy sync ve data katmanı üzerinden refaktör öncesi/sonrası karşılaştırması yapacağız.',
    chapters: [
      {
        title: 'S — Single Responsibility',
        intro:
          'BlogForm yalnızca form state ve submit UI. API çağrısı parent veya custom hook\'ta. Validation Zod modülünde.',
        steps: [
          '200+ satır component\'i bölün.',
          'İş kuralını service fonksiyonuna taşıyın.',
          'Test\'i küçük birimlere yazın.',
        ],
      },
      {
        title: 'O — Open/Closed',
        intro:
          'Yeni comment status eklerken mevcut switch\'leri kırmayın; status → handler map kullanın.',
        code: `const statusHandlers: Record<Status, (c: Comment) => void> = {
  PENDING: moderatePending,
  APPROVED: noop,
  REJECTED: notifyRejection,
};`,
      },
      {
        title: 'D — Dependency Inversion',
        intro:
          'Route handler doğrudan prisma çağırmak yerine data katmanına bağımlı. Test\'te mock data layer inject edilebilir.',
        tip: 'Her fonksiyon için interface şart değil; karmaşıklık arttıkça ekleyin.',
      },
    ],
    commonMistakes: [
      'Abstraction enflasyonu',
      'SOLID isimlerini ezberleyip uygulamamak',
      'Client\'ta business rule',
    ],
    exercises: [
      'Bir büyük component\'i 3 dosyaya bölün',
      'Status switch\'i map pattern\'e çevirin',
    ],
    nextSteps: ['Design Patterns (Gang of Four) seçici okuma'],
  },
  {
    title: 'Web Erişilebilirliği (WCAG 2.2): Uygulamalı a11y',
    photoId: '1498050108023-c5249f4df085',
    tags: ['accessibility', 'a11y', 'wcag', 'ux'],
    categories: ['Web Geliştirme', 'UX'],
    stackNote: 'WCAG 2.2 AA, axe-core, React 19, keyboard navigation',
    prerequisites: [
      'Semantik HTML temelleri',
      'React form ve button kullanımı',
      'Tarayıcı DevTools',
    ],
    objectives: [
      'WCAG POUR prensiplerini uygulamak',
      'Klavye ile tam gezinme sağlamak',
      'ARIA\'yı doğru ve minimum kullanmak',
      'Otomatik ve manuel test süreci kurmak',
    ],
    summaryIntro:
      'Erişilebilirlik engelli kullanıcılar için değil, herkes için daha iyi UX\'tir: klavye, düşük görüş, yavaş bağlantı, ekran okuyucu.',
    summaryHook:
      'Blog arama, modal auth ve yorum formu üzerinden erişilebilir pattern\'leri uygulayacağız.',
    chapters: [
      {
        title: 'Bölüm 1: Semantik HTML',
        intro:
          '<code>main</code>, <code>nav</code>, <code>article</code>, <code>button</code> doğru kullanım. div onClick anti-pattern.',
        steps: [
          'Sayfa başına tek h1 kontrol edin.',
          'Form input\'lara <code>label htmlFor</code> bağlayın.',
          'İkon-only butona aria-label ekleyin.',
        ],
      },
      {
        title: 'Bölüm 2: Klavye ve focus',
        intro:
          'Tab sırası mantıklı olmalı. Modal açılınca focus trap; kapanınca trigger\'a dönüş.',
        warning: 'outline: none global CSS erişilebilirliği yok eder; :focus-visible kullanın.',
      },
      {
        title: 'Bölüm 3: Test süreci',
        intro:
          'CI\'da axe; release öncesi VoiceOver/NVDA ile manuel test. Kontrast 4.5:1 (normal metin).',
        list: {
          type: 'ol',
          items: [
            'eslint-plugin-jsx-a11y kuralları',
            'Playwright + axe entegrasyonu',
            'Manuel keyboard walkthrough checklist',
          ],
        },
      },
    ],
    commonMistakes: [
      'role="button" div ile klavye desteği eksik',
      'Canlı bölge (aria-live) olmadan dinamik hata mesajı',
      'Düşük kontrast tema renkleri',
    ],
    exercises: [
      'Auth modal\'ı klavye-only ile baştan sona test edin',
      'Bir sayfada axe violation sıfırlayın',
    ],
    nextSteps: ['WCAG 2.2 resmi spec özeti', 'Inclusive design workshop'],
  },
  {
    title: 'OpenTelemetry: Trace, Metric ve Log Korelasyonu',
    photoId: '1618477247221-94724831379e',
    tags: ['opentelemetry', 'observability', 'monitoring', 'logging'],
    categories: ['DevOps', 'Altyapı'],
    stackNote: 'OpenTelemetry JS SDK, OTLP exporter, structured logging, Next.js 16',
    prerequisites: [
      'HTTP request/response modeli',
      'Production hata ayıklama deneyimi',
      'Temel istatistik (p50, p95)',
    ],
    objectives: [
      'Trace, metric, log üçlüsünü kurmak',
      'traceId ile log korelasyonu yapmak',
      'Prisma ve HTTP span\'leri instrument etmek',
      'Sampling ile maliyeti kontrol etmek',
    ],
    summaryIntro:
      '"Yavaş" demek yeterli değil; hangi span, hangi SQL, kaç ms — observability olmadan production kör uçuştur.',
    summaryHook:
      'Next.js route → Prisma query zincirine trace ekleyip structured log ile birleştirmeyi öğreneceksiniz.',
    chapters: [
      {
        title: 'Bölüm 1: Üç sütun modeli',
        intro:
          'Metrics: RED (rate, errors, duration). Traces: dağıtık yolculuk. Logs: yapılandırılmış olaylar.',
        list: {
          type: 'ul',
          items: [
            'Metric: blog_list_duration_ms histogram',
            'Trace: GET /api/blog span',
            'Log: { level, traceId, route, ms }',
          ],
        },
      },
      {
        title: 'Bölüm 2: Instrumentation',
        intro:
          '@opentelemetry/auto-instrumentations-node ile HTTP ve çoğu kütüphane. Custom span: taxonomy sync.',
        code: `import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('blog-app');
await tracer.startActiveSpan('syncBlogTaxonomy', async (span) => {
  try { await syncBlogTaxonomy(id, tags); }
  finally { span.end(); }
});`,
        tip: 'PII ve şifre log veya span attribute\'a yazılmaz.',
      },
      {
        title: 'Bölüm 3: Operasyon',
        intro:
          'Sampling: development %100, production %5–10 başlangıç. Alert: error rate ve p95 latency eşiği.',
      },
    ],
    commonMistakes: [
      'console.log ile production debug',
      'TraceId olmadan dağınık log dosyaları',
      '%100 sampling maliyeti',
    ],
    exercises: [
      'Bir API route\'a custom span ekleyin',
      'Hata log\'unda traceId göründüğünü doğrulayın',
    ],
    nextSteps: ['Grafana Tempo/Jaeger dashboard', 'SLO/SLA tanımı'],
  },
  {
    title: 'Git Workflow: Trunk-Based Development ve Feature Flag',
    photoId: '1517699154558-42d6f41ee5f6',
    tags: ['git', 'trunk-based', 'feature-flags', 'devops'],
    categories: ['DevOps', 'Ekip Çalışması'],
    stackNote: 'Git 2.x, GitHub PR, feature flag (Unleash/LaunchDarkly kavramı)',
    prerequisites: [
      'Git branch, merge, rebase temelleri',
      'PR review süreci',
      'CI yeşil olmadan merge politikası',
    ],
    objectives: [
      'Trunk-based akışı uygulamak',
      'Kısa ömürlü branch disiplini',
      'Feature flag ile yarım özelliği main\'de tutmak',
      'Conventional commits ile changelog üretmek',
    ],
    summaryIntro:
      'Uzun ömürlü feature branch merge cehennemine dönüşür. Trunk-based, main\'i her zaman deploy edilebilir tutmayı hedefler.',
    summaryHook:
      'Günlük deploy hedefleyen web ekibi için branch, flag ve release ritmini kuracağız.',
    chapters: [
      {
        title: 'Bölüm 1: Trunk-based temeller',
        intro:
          'Branch ömrü 1-2 gün. Küçük PR. Main korumalı; required checks zorunlu.',
        steps: [
          'Feature flag altyapısı seçin veya basit env flag ile başlayın.',
          'Yarım kodu flag arkasına alın.',
          'Gün sonunda PR merge veya discard — yaşayan branch bırakmayın.',
        ],
      },
      {
        title: 'Bölüm 2: Feature flag',
        intro:
          'Deploy ≠ release. Flag kapalıyken kod production\'da ama kullanıcı görmez.',
        list: {
          type: 'ul',
          items: [
            'Release flag: kısa ömür, silinir',
            'Ops kill switch: acil kapatma',
            'Experiment: A/B metrik',
          ],
        },
      },
      {
        title: 'Bölüm 3: GitFlow ne zaman?',
        intro:
          'Ayda bir store review (mobil) veya regulated sektörde release branch hâlâ görülür. Web SaaS için trunk tercih.',
      },
    ],
    commonMistakes: [
      'Flag silmeden biriken teknik borç',
      'Main kırmızıyken merge',
      'Rebase yerine merge commit seli',
    ],
    exercises: [
      'Yeni özelliği flag ile ship edin',
      'Conventional commit ile 5 commit mesajı düzeltin',
    ],
    nextSteps: ['Merge queue (GitHub)', 'Release train dokümantasyonu'],
  },
  {
    title: 'Feature Flags: Kademeli Rollout ve Kill Switch',
    photoId: '1551288049-bebda4e38f71',
    tags: ['feature-flags', 'rollout', 'devops', 'urun'],
    categories: ['DevOps', 'Ürün'],
    stackNote: 'Unleash / LaunchDarkly kavramları, Next.js middleware, observability',
    prerequisites: [
      'Production deploy deneyimi',
      'Metric ve hata oranı takibi',
      'Trunk-based veya benzeri akış',
    ],
    objectives: [
      'Flag türlerini ayırt etmek',
      'Yüzde rollout ile riski düşürmek',
      'Otomatik rollback kriteri tanımlamak',
      'Ölü flag temizliği süreci kurmak',
    ],
    summaryIntro:
      'Yeni blog editörünü %100 kullanıcıya aynı gün açmak risklidir. Kademeli rollout hatayı izole eder.',
    summaryHook:
      'Yeni TaxonomyFilter veya arama özelliğini flag ile %1 → %10 → %100 açma planı yazacağız.',
    chapters: [
      {
        title: 'Bölüm 1: Flag yaşam döngüsü',
        intro:
          'Oluştur → rollout → tam aç → kod ve flag\'i sil. Ölü flag okunabilirliği öldürür.',
        steps: [
          'Flag adı convention: <code>blog_new_search_enabled</code>.',
          'Default false production\'da.',
          'Kill switch dashboard veya env override.',
        ],
      },
      {
        title: 'Bölüm 2: Rollout metrikleri',
        intro:
          'Her adımda error rate, p95 latency, conversion. Anomali → otomatik flag kapat.',
        warning: 'Sadece hata değil; business metric (yorum oranı düşüşü) de izleyin.',
      },
      {
        title: 'Bölüm 3: Teknik uygulama',
        intro:
          'Server\'da flag değerlendir; client\'a sadece boolean prop. Hassas flag logic sunucuda kalsın.',
        code: `const enabled = await flags.isEnabled('blog_new_search');
if (!enabled) return <LegacySearch />;
return <BlogSearch />;`,
      },
    ],
    commonMistakes: [
      'Flag\'i client secret ile değerlendirmek',
      'Rollout adımı atlamak',
      'Quarterly audit yapmamak',
    ],
    exercises: [
      'Bir UI özelliğini env flag ile sarın',
      'Rollout tablosu (%, metrik, süre) dokümante edin',
    ],
    nextSteps: ['Unleash self-hosted kurulum', 'A/B istatistik temelleri'],
  },
  {
    title: 'Kubernetes Başlangıç: Pod, Deployment ve Ingress',
    photoId: '1633356122544-f134324a6cee',
    tags: ['kubernetes', 'k8s', 'container', 'devops'],
    categories: ['DevOps', 'Altyapı'],
    stackNote: 'Kubernetes 1.30+, kubectl, Ingress NGINX, container image from Docker öğretici',
    prerequisites: [
      'Docker ve Dockerfile deneyimi',
      'HTTP ve DNS temel bilgisi',
      'YAML syntax',
    ],
    objectives: [
      'Pod, Deployment, Service kavramlarını anlamak',
      'Next.js uygulamasını cluster\'a deploy etmek',
      'Ingress ile TLS ve routing yapmak',
      'Liveness/readiness probe ayarlamak',
    ],
    summaryIntro:
      'Kubernetes, container\'ları ölçeklenebilir şekilde yönetir. Öğrenme eğrisi dik; production\'da managed cluster (EKS, GKE, AKS) tercih edilir.',
    summaryHook:
      'Blog uygulaması image\'ını cluster\'a alıp health check ve Ingress ile dış dünyaya açmayı adım adım yapacağız.',
    chapters: [
      {
        title: 'Bölüm 1: İlk Deployment',
        intro:
          'Pod geçicidir; Deployment replica ve rolling update sağlar.',
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-app
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: app
          image: your-registry/blog:latest
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet: { path: /api/health, port: 3000 }`,
        steps: [
          'kubectl apply -f deployment.yaml',
          'kubectl get pods -w ile durumu izleyin',
          'Image pull secret registry için tanımlayın',
        ],
      },
      {
        title: 'Bölüm 2: Service ve Ingress',
        intro:
          'ClusterIP internal; Ingress external HTTP(S). TLS cert-manager ile otomatik.',
      },
      {
        title: 'Bölüm 3: Yapılandırma ve secret',
        intro:
          'ConfigMap env; Secret connection string. asla plain text git\'e commit etmeyin.',
      },
    ],
    commonMistakes: [
      'Readiness olmadan traffic',
      'Root container',
      'latest tag production',
    ],
    exercises: [
      'Local minikube/kind ile deploy deneyin',
      'Readiness fail simülasyonu yapın',
    ],
    nextSteps: ['HPA autoscaling', 'Helm chart'],
  },
  {
    title: 'Yapay Zeka ve LLM Araçları: Geliştirici İçin Güvenli Kullanım',
    photoId: '1677442136019-21780ecad995',
    tags: ['ai', 'llm', 'cursor', 'verimlilik'],
    categories: ['Programlama', 'Ürün'],
    stackNote: 'Cursor, Copilot, GPT-4 class modeller (2026), kod review süreçleri',
    prerequisites: [
      'Günlük kod yazımı ve code review',
      'Git ve PR akışı',
      'Temel güvenlik bilinci (secret, PII)',
    ],
    objectives: [
      'LLM\'i doğru görevlerde kullanmak',
      'Prompt ve context disiplini oluşturmak',
      'AI çıktısını review checklist\'ine almak',
      'Mimari kararı insanda tutmak',
    ],
    summaryIntro:
      'AI pair programmer rutin işi hızlandırır; domain modeli ve güvenlik sorumluluğu geliştiricide kalır.',
    summaryHook:
      'Boilerplate, test, dokümantasyon ve refactor\'da AI; auth, ödeme ve veri modelinde insan onayı workflow\'u kuracağız.',
    chapters: [
      {
        title: 'Bölüm 1: Uygun kullanım alanları',
        intro:
          'İyi: test iskeleti, regex, SQL explain yorumu, CRUD tekrarı. Kötü: tek başına auth/şifreleme tasarımı.',
        list: {
          type: 'ul',
          items: [
            'Zod şema taslağı → insan review',
            'Migration SQL önerisi → DBA/lead onayı',
            'UI bileşen iskeleti → design system uyumu kontrolü',
          ],
        },
      },
      {
        title: 'Bölüm 2: Güvenlik ve gizlilik',
        intro:
          'API key, .env, müşteri verisi prompt\'a girmez. .cursorignore ile context sınırı.',
        warning: 'Hallucinated API kullanımı compile\'da yakalanır; subtle logic hatası production\'a çıkar — test şart.',
      },
      {
        title: 'Bölüm 3: Ekip politikası',
        intro:
          'PR\'da "AI-assisted" şeffaflığı. Senior mimari ve güvenlik review\'da son söz. Junior için mentorluk artar, sorumluluk azalmaz.',
        blockquote: 'AI hızı artırır; kalite kapıları (test, review) kalır.',
      },
    ],
    commonMistakes: [
      'Review etmeden AI kodunu merge',
      'Secret ile prompt paylaşımı',
      'Eski API bilgisine güvenmek',
    ],
    exercises: [
      'Bir modül için AI ile test yazıp coverage artırın',
      'Ekip için 1 sayfalık AI kullanım politikası taslağı oluşturun',
    ],
    nextSteps: ['Agentic workflow risk analizi', 'Lisans ve telif farkındalığı'],
  },
  {
    title: 'Web Güvenliği: OWASP Top 10 ve Next.js Savunmaları',
    photoId: '1555949963-aa79dcee981c',
    tags: ['guvenlik', 'owasp', 'xss', 'csrf'],
    categories: ['Güvenlik', 'Web Geliştirme'],
    stackNote: 'OWASP Top 10 (2025), Next.js 16, DOMPurify 3.x, next-auth 5, Prisma 7',
    prerequisites: [
      'HTTP ve cookie temelleri',
      'React ve form handling',
      'Auth flow farkındalığı',
    ],
    objectives: [
      'OWASP Top 10 risklerini tanımak',
      'XSS ve injection\'a karşı somut önlem almak',
      'Auth ve session hatalarını önlemek',
      'Güvenlik checklist\'ini CI\'a entegre etmek',
    ],
    summaryIntro:
      'Güvenlik sonradan eklenmez. Blog yorumu, rich text editör ve admin paneli tipik saldırı yüzeyleridir.',
    summaryHook:
      'Bu projedeki sanitizeHtml, role check ve rate limit pattern\'lerini OWASP çerçevesinde öğreteceğiz.',
    chapters: [
      {
        title: 'Bölüm 1: XSS',
        intro:
          'Stored XSS: kötü niyetli blog içeriği. DOMPurify ile sanitize; CSP ile ek katman.',
        code: `import { sanitizeHtml } from '@/lib/sanitize';
// dangerouslySetInnerHTML yalnızca sanitize sonrası
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />`,
        steps: [
          'Tüm rich text giriş/çıkışında sanitize.',
          'CSP header\'ı nonce veya strict policy ile deneyin.',
          'Kullanıcı HTML upload\'ını kısıtlayın.',
        ],
      },
      {
        title: 'Bölüm 2: Injection ve auth',
        intro:
          'Prisma parametreli sorgu. Raw SQL\'de placeholder. Broken access control: her mutation\'da session + role.',
        list: {
          type: 'ul',
          items: [
            'IDOR: başkasının blog\'unu PATCH etmeyi test edin',
            'Rate limit login ve yorum',
            'Dependency audit CI\'da',
          ],
        },
      },
      {
        title: 'Bölüm 3: Security headers',
        intro:
          'X-Frame-Options, HSTS, Referrer-Policy. next.config headers veya middleware.',
      },
    ],
    commonMistakes: [
      'Client-side only authorization',
      'Sanitize etmeden innerHTML',
      'Verbose error stack client\'a',
    ],
    exercises: [
      'XSS payload ile yorum alanını test edin (staging)',
      'Moderator olmayan kullanıcı ile admin API 403 doğrulayın',
    ],
    nextSteps: ['OWASP ASVS checklist', 'Penetrasyon testi planı'],
  },
];
