# tunahanipek.com

Kişisel site monoreposu: **home** (landing) + **blog** (CMS/portfolio).

| Uygulama | Dizin | URL (prod) | Stack |
|----------|-------|------------|-------|
| Landing | [`home/`](home/) | https://tunahanipek.com | Next.js 13 |
| Blog | [`blog/`](blog/) | https://blog.tunahanipek.com | Next.js 16, Prisma, NextAuth |

## Çalıştırma modları

Üç pratik yol var; günlük geliştirmede çoğu zaman **Docker `dev` profili** veya **sadece DB Docker + yarn dev** kullanılır. Prod’a yakın davranışı görmek için **`full` profili** veya `yarn build && yarn start` tercih edilir.

| Mod | Ne zaman? | Blog URL | Home URL |
|-----|-----------|----------|----------|
| Docker `dev` | Tek komutla hot reload, takım ortamına yakın | http://localhost:3000 | http://localhost:3001 |
| DB Docker + `yarn dev` | En hızlı iterasyon, IDE debugger | http://localhost:3000 | http://localhost:3001 |
| Docker `full` veya `yarn start` | Prod build, migration deploy, performans | http://localhost:3000 | http://localhost:3001 |

### İlk kurulum (repo kökü)

```bash
cp .env.example .env
# NEXTAUTH_SECRET / NEXTAUTH_SALT üret: openssl rand -base64 32
```

Blog’u Docker dışında çalıştıracaksanız ayrıca `blog/.env` gerekir (`blog/.env.template`).

---

## Docker ile geliştirme (`dev` profili)

Tüm geliştirme stack’i: PostgreSQL + blog (hot reload) + home (hot reload).

```bash
# Başlat (arka planda)
docker compose --profile dev up -d

# Logları izle (ilk açılışta install + db push + seed uzun sürebilir)
docker compose --profile dev logs -f blog-dev

# Durdur
docker compose --profile dev down

# Durdur + volume’ları da sil (DB ve node_modules volume sıfırlanır)
docker compose --profile dev down -v
```

**İlk `up` sonrası `blog-dev` sırası:** `yarn install` → `prisma generate` → `db push` → `seed` → `yarn dev`. Bittiğinde blog hazırdır.

| Servis | Container | Host port |
|--------|-----------|-----------|
| PostgreSQL | `tunahanipek-db` | 5432 |
| Blog (dev) | `tunahanipek-blog-dev` | 3000 |
| Home (dev) | `tunahanipek-home-dev` | 3001 |

Seed admin (yalnızca dev): `admin@admin.com` / `1234asdf` — ayrıntı [`blog/README.md`](blog/README.md).

Kod `./blog` ve `./home` volume ile bağlıdır; kayıt kaydedince Next.js yeniden derler. `node_modules` ayrı named volume’da tutulur (host ile çakışmaz).

`.env` içinde dev için tipik değerler (`.env.example` ile uyumlu):

- `NEXTAUTH_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://localhost:3000`
- `POSTGRES_PASSWORD` — compose’taki DB şifresi ile aynı olmalı

---

## Yerel geliştirme (Docker’sız veya yalnızca DB)

Host’ta Node ile çalıştırmak genelde daha hızlıdır; Prisma/IDE doğrudan makinenizde çalışır.

```bash
# 1) Yalnızca veritabanı (arka planda)
docker compose up -d database

# 2) Blog
cd blog
cp .env.template .env
# POSTGRES_PRISMA_URL örnek (şifre .env kökündeki POSTGRES_PASSWORD ile aynı):
# postgresql://postgres:tuna213@localhost:5432/postgres?schema=public

yarn install
yarn generate-local   # generate + db push + seed
yarn dev              # http://localhost:3000

# 3) Home — ayrı terminal
cd home
yarn install
yarn dev              # http://localhost:3001
```

DB’yi durdurmak: `docker compose down` (yalnızca `database` servisi çalışıyorsa yine aynı komut).

---

## Prod testi (local)

Üretime yakın davranış: optimized Next build, blog’da `NODE_ENV=production` ve container girişinde `prisma migrate deploy`.

### A) Docker `full` profili (önerilen tam stack testi)

```bash
cp .env.example .env
```

`.env` içinde **build anında gömülen** `NEXT_PUBLIC_*` ve oturum URL’lerini local’e çekin:

```env
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_SECRET=<güçlü-secret>
NEXTAUTH_SALT=<güçlü-salt>
```

```bash
# İmajları yeniden derle ve kaldır
docker compose --profile full up --build -d

# Log
docker compose --profile full logs -f blog

# Durdur
docker compose --profile full down
```

| Servis | Açıklama |
|--------|----------|
| `blog` | Prod Dockerfile, entrypoint’te `migrate deploy`, ardından `yarn start` |
| `home` | Prod build, `yarn start` |
| `database` | Aynı Postgres volume (dev ile paylaşılabilir; port çakışmasına dikkat) |

`dev` ve `full` aynı anda `BLOG_PORT=3000` kullanır — ikisini birden çalıştırmayın.

Home’un blog’dan özgeçmiş çekmesi için üretimde `BLOG_API_URL` kullanılır; `full` compose’ta home servisine henüz aktarılmıyorsa landing CV linki prod blog URL’sine düşebilir. Tam local entegrasyon testi için host’ta `yarn build && yarn start` + `BLOG_API_URL=http://localhost:3000` daha nettir (aşağı).

### B) Host’ta prod build (tek uygulama)

```bash
# Blog — DB ayakta olmalı (docker compose up -d database veya Neon URL)
cd blog
yarn install
yarn build          # prisma generate + next build
yarn start          # http://localhost:3000

# Home — ayrı terminal
cd home
yarn install
BLOG_API_URL=http://localhost:3000 yarn build
BLOG_API_URL=http://localhost:3000 yarn start   # http://localhost:3001
```

Neon / uzak DB ile prod şema testi: [`blog/README.md`](blog/README.md) → *Veritabanı ve migration'lar*.

---

## Docker profilleri (özet)

| Komut | Profil | Çalışan servisler |
|-------|--------|-------------------|
| `docker compose up -d` | (varsayılan) | Yalnızca `database` |
| `docker compose --profile dev up -d` | `dev` | `database` + `blog-dev` + `home-dev` |
| `docker compose --profile full up --build -d` | `full` | `database` + `blog` + `home` (prod) |

Yararlı komutlar:

```bash
docker compose ps
docker compose --profile dev restart blog-dev
docker compose exec database psql -U postgres -d postgres
```

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
