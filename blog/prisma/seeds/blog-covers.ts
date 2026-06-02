/**
 * Her blog kapağı: benzersiz + konuyla uyumlu.
 * Unsplash photoId'ler HTTP 200 ile doğrulanmıştır.
 * Eksik konularda picsum seed (görsel olarak da benzersiz ve kalıcı).
 */
export const BLOG_COVER_KEYS = {
  typescript: 'typescript',
  prisma: 'prisma',
  nextjs: 'nextjs',
  nextauth: 'nextauth',
  restApi: 'restApi',
  docker: 'docker',
  cicd: 'cicd',
  testing: 'testing',
  redis: 'redis',
  postgresql: 'postgresql',
  microservices: 'microservices',
  eventDriven: 'eventDriven',
  solid: 'solid',
  a11y: 'a11y',
  opentelemetry: 'opentelemetry',
  gitWorkflow: 'gitWorkflow',
  featureFlags: 'featureFlags',
  kubernetes: 'kubernetes',
  ai: 'ai',
  webSecurity: 'webSecurity',
} as const;

export type BlogCoverKey = keyof typeof BLOG_COVER_KEYS;

/** Unsplash photo-{id} veya picsum:{seed} */
const COVER_SOURCES: Record<BlogCoverKey, string> = {
  /** Kod editörü / TypeScript */
  typescript: '1516116216624-53e697fedbea',
  /** Veri tabanı şeması / planlama */
  prisma: '1454165804606-c3d57bc86b40',
  /** Laptop üzerinde geliştirme */
  nextjs: '1555066931-4365d14bab8c',
  /** Güvenlik / oturum */
  nextauth: 'picsum:blog-cover-nextauth-security',
  /** API / kod ekranı */
  restApi: '1558494949-ef010cbdcc31',
  /** Konteyner / DevOps */
  docker: 'picsum:blog-cover-docker-containers',
  /** İş akışı / pipeline */
  cicd: '1552664730-d307ca884978',
  /** Test / analitik ekran */
  testing: '1461749280684-dccba630e2f6',
  /** Veri görselleştirme / cache metrikleri */
  redis: '1551288049-bebda4e38f71',
  /** İlişkisel veritabanı */
  postgresql: 'picsum:blog-cover-postgresql-data',
  /** Dağıtık sistem / ağ */
  microservices: '1451187580459-43490279c0fa',
  /** Yapay zeka / olay akışı */
  eventDriven: '1555949963-aa79dcee981c',
  /** Temiz çalışma alanı / kod kalitesi */
  solid: '1498050108023-c5249f4df085',
  /** Erişilebilirlik / odaklı kullanım */
  a11y: '1600880292203-757bb62b4baf',
  /** Ekip / gözlemlenebilirlik operasyonları */
  opentelemetry: '1504384308090-c894fdcc538d',
  /** Ekip işbirliği / sürüm kontrolü */
  gitWorkflow: '1551434678-e076c223a692',
  /** Bulut altyapı / özellik yönetimi */
  featureFlags: '1561070791-2526d30994b5',
  /** Kubernetes / bulut native */
  kubernetes: '1633356122544-f134324a6cee',
  /** Yapay zeka */
  ai: '1677442136019-21780ecad995',
  /** Güvenlik / siber savunma */
  webSecurity: '1571171637578-41bc2dd41cd2',
};

export function resolveCoverSource(key: BlogCoverKey): string {
  return COVER_SOURCES[key];
}
