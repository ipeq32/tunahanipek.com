# tunahanipek.com

Kişisel site monoreposu: **home** (landing) + **blog** (CMS/portfolio).

| Uygulama | Dizin | URL (prod) | Stack |
|----------|-------|------------|-------|
| Landing | [`home/`](home/) | https://tunahanipek.com | Next.js 13 |
| Blog | [`blog/`](blog/) | https://blog.tunahanipek.com | Next.js 16, Prisma, NextAuth |

## Hızlı başlangıç

### Yerel (ayrı terminaller)

```bash
# Veritabanı
docker compose up -d

# Blog
cd blog
cp .env.template .env
yarn install
yarn generate-local
yarn dev

# Home (port 3001)
cd home
yarn install
yarn dev
```

### Docker (tüm stack)

```bash
cp .env.example .env

# Geliştirme: DB + blog + home (hot reload)
docker compose --profile dev up

# Üretim imajları
docker compose --profile full up --build
```

| Profil | Servisler |
|--------|-----------|
| (varsayılan) | Yalnızca PostgreSQL |
| `dev` | DB + `blog-dev` + `home-dev` |
| `full` | DB + `blog` + `home` (prod build) |

## Ortam değişkenleri

Kök [`.env.example`](.env.example) — Docker ve paylaşılan değerler.  
Blog ayrıntıları: [`blog/.env.template`](blog/.env.template) ve [`blog/README.md`](blog/README.md).

| Değişken | Açıklama |
|----------|----------|
| `POSTGRES_PASSWORD` | PostgreSQL şifresi |
| `BLOG_PORT` / `HOME_PORT` | Host portları |
| `NEXTAUTH_*` | Blog oturumu |
| `UPLOADTHING_TOKEN` | Blog görsel yükleme |
| `RESEND_API_KEY` / `EMAIL_FROM` | E-posta (şifre sıfırlama, iletişim formu) |
| `NEXT_PUBLIC_SITE_URL` | Blog canonical URL |
| `ALLOW_PUBLIC_REGISTRATION` | `false` → kayıt kapalı |

## CI

- Blog: [`.github/workflows/blog-ci.yml`](.github/workflows/blog-ci.yml)
- Home: [`.github/workflows/home-ci.yml`](.github/workflows/home-ci.yml)

## Dokümantasyon

- [Blog API](blog/docs/API.md)
- [Blog TODO](blog/TODO.md) (tamamlandı)
