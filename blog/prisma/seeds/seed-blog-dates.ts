/**
 * Seed blogları için içerik sırasına uygun yayın tarihleri.
 * Ay/yıl başı (1.) kullanılmaz; 2023 Nisan–Haziran aralığından başlar.
 */
const BLOG_PUBLISH_DATES: Record<string, string> = {
  // Temel dil, veri ve framework
  'TypeScript 5.9+ ve Zod ile Tip Güvenli Full-Stack Geliştirme':
    '2023-04-18T09:42:00.000Z',
  'Prisma 7 ve PostgreSQL: Üretim Kalitesinde Veri Katmanı':
    '2023-05-09T11:15:00.000Z',
  'Next.js 16 App Router: Server Components Öğreticisi':
    '2023-05-31T14:28:00.000Z',
  'NextAuth (Auth.js) v5 ile Güvenli Oturum Yönetimi':
    '2023-06-22T10:06:00.000Z',
  'REST API Tasarımı ve Next.js Route Handlers':
    '2023-07-17T16:33:00.000Z',

  // Altyapı, CI ve kalite
  "Docker ve Docker Compose: Geliştirmeden Production'a":
    '2023-08-08T09:51:00.000Z',
  'GitHub Actions ile CI/CD: Test, Build ve Deploy':
    '2023-09-05T13:22:00.000Z',
  'Test Piramidi: Vitest, Entegrasyon ve Playwright E2E':
    '2023-10-03T10:47:00.000Z',
  'Redis Önbellekleme: Cache-Aside, TTL ve Invalidation':
    '2023-10-24T15:18:00.000Z',
  'PostgreSQL Performans: Index, EXPLAIN ve Pool Tuning':
    '2023-11-15T11:39:00.000Z',

  // Mimari ve ekip pratikleri
  'Mikroservis ve Modüler Monolit: Mimari Karar Rehberi':
    '2023-12-12T09:24:00.000Z',
  'Event-Driven Mimari: Outbox, Saga ve Mesaj Kuyruğu':
    '2024-01-23T14:05:00.000Z',
  'SOLID ve Temiz Kod: React/TypeScript Projelerinde Uygulama':
    '2024-02-19T10:58:00.000Z',
  'Web Erişilebilirliği (WCAG 2.2): Uygulamalı a11y':
    '2024-03-14T16:12:00.000Z',
  'OpenTelemetry: Trace, Metric ve Log Korelasyonu':
    '2024-04-09T11:27:00.000Z',
  'Git Workflow: Trunk-Based Development ve Feature Flag':
    '2024-05-07T09:44:00.000Z',
  'Feature Flags: Kademeli Rollout ve Kill Switch':
    '2024-06-04T15:31:00.000Z',
  'Kubernetes Başlangıç: Pod, Deployment ve Ingress':
    '2024-07-02T10:19:00.000Z',
  'Web Güvenliği: OWASP Top 10 ve Next.js Savunmaları':
    '2024-08-06T13:46:00.000Z',

  // İleri Next.js, API ve domain
  'Next.js Server Actions: Form, Mutation ve Güvenli Veri Yazımı':
    '2024-09-12T09:33:00.000Z',
  'next-intl ile Çok Dilli Next.js: Routing, Mesajlar ve SEO':
    '2024-10-17T14:21:00.000Z',
  'GraphQL API: Şema Tasarımı, N+1 ve Next.js Entegrasyonu':
    '2024-11-21T11:08:00.000Z',
  'PostgreSQL Migration Stratejileri: Zero-Downtime ve Geri Alma':
    '2025-01-14T10:52:00.000Z',
  'API Güvenliği: OAuth2 Scope, Rate Limit ve OWASP API Top 10':
    '2025-02-18T16:37:00.000Z',
  'Contract Testing ve API Regresyonu: Pact ve OpenAPI Diff':
    '2025-03-26T09:15:00.000Z',
  'Domain-Driven Design: Bounded Context ve Modüler Monolit':
    '2025-05-08T13:29:00.000Z',
};

export function resolveSeededBlogCreatedAt(title: string): Date {
  const iso = BLOG_PUBLISH_DATES[title];
  if (!iso) {
    throw new Error(`Seed blog için yayın tarihi tanımlı değil: "${title}"`);
  }
  return new Date(iso);
}

export function assertAllSeedBlogsHavePublishDates(titles: string[]) {
  const missing = titles.filter((title) => !(title in BLOG_PUBLISH_DATES));
  if (missing.length > 0) {
    throw new Error(
      `Eksik seed yayın tarihleri (${missing.length}): ${missing.join(', ')}`,
    );
  }
}
