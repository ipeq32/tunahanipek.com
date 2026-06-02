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
| `NEXT_PUBLIC_API_URL` | SSR fetch için API base URL |

## Seed admin (geliştirme)

`yarn seed` sonrası: `admin@admin.com` / `1234asdf` (sadece dev ortamı).

## Docker

Repo kökünden:

```bash
docker compose --profile blog up
```

## Yapılacaklar

Bkz. [TODO.md](./TODO.md)
