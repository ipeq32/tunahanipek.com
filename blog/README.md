# Blog

Next.js 16 blog uygulaması (Prisma, NextAuth, next-intl).

## Gereksinimler

- Node.js >= 22
- PostgreSQL
- Yarn

## Kurulum

```bash
cp .env.template .env
# .env dosyasını düzenleyin

yarn install
yarn generate-local   # prisma generate + db push + seed
yarn dev
```

## Ortam değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `NEXTAUTH_URL` | Uygulama URL (ör. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `POSTGRES_PRISMA_URL` | Prisma bağlantı URL |
| `POSTGRES_URL_NON_POOLING` | Prisma direct URL |
| `NEXT_PUBLIC_API_URL` | SSR fetch için API base URL |
| `NEXT_PUBLIC_SITE_URL` | Prod canonical URL (sitemap, OG) |
| `UPLOADTHING_TOKEN` | Görsel yükleme |
| `RESEND_API_KEY` | E-posta (şifre sıfırlama, iletişim formu) |
| `EMAIL_FROM` | Gönderen adres (Resend) |
| `VERCEL_URL` | Host fallback (Vercel / Docker) |
| `ALLOW_PUBLIC_REGISTRATION` | `false` ile kayıt kapatılır |

## Seed admin (geliştirme)

`yarn seed` sonrası: `admin@admin.com` / `1234asdf` (sadece dev ortamı).

## Docker

Repo kökünden:

```bash
# Geliştirme (blog + DB)
docker compose --profile dev up

# Üretim (blog + home + DB)
docker compose --profile full up
```

## Test

```bash
yarn test        # Vitest (unit)
yarn test:e2e    # Playwright (sunucu çalışırken)
```

## API

Bkz. [docs/API.md](./docs/API.md)

## Zengin metin ve güvenlik

Blog ve proje formları `react-quill-new` ile HTML içerik üretir. Kayıt öncesi sunucu tarafında [`src/lib/sanitize.ts`](src/lib/sanitize.ts) ile temizlenir: izin verilen etiketler, güvenli linkler (`https://`, dış linklerde `rel="noopener noreferrer"`). Blog/proje oluşturma veya güncelleme sonrası [`src/lib/revalidate-public.ts`](src/lib/revalidate-public.ts) public sayfaları anında yeniler.

## Yapılacaklar

Bkz. [TODO.md](./TODO.md) — tüm maddeler tamamlandı.
