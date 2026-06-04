# Blog

Next.js 16 blog uygulaması (Prisma, NextAuth, next-intl).

## Gereksinimler

- Node.js >= 22
- PostgreSQL
- Yarn

## Kurulum

### Yerel (Node + isteğe bağlı DB container)

Repo kökünde yalnızca Postgres:

```bash
docker compose up -d database
```

Blog dizininde:

```bash
cp .env.template .env
# POSTGRES_PRISMA_URL örnek:
# postgresql://postgres:tuna213@localhost:5432/postgres?schema=public

yarn install
yarn generate-local   # prisma generate + db push + seed
yarn dev              # http://localhost:3000
```

Tam monorepo akışı (Docker dev, prod test, portlar): [kök README](../README.md).

### Docker ile geliştirme (`dev` profili)

Repo **kökünden** (blog klasöründen değil):

```bash
cp ../.env.example ../.env   # veya kökte zaten .env varsa düzenle
docker compose --profile dev up -d
docker compose --profile dev logs -f blog-dev
```

İlk açılışta container içinde `db push` + `seed` çalışır; hazır olunca http://localhost:3000.

Durdurma:

```bash
docker compose --profile dev down
```

DB + `node_modules` volume sıfırlama: `docker compose --profile dev down -v`.

### Prod’a yakın local test

| Yöntem | Komut | Not |
|--------|-------|-----|
| Docker prod imajı | Kökten: `docker compose --profile full up --build -d` | Entrypoint `migrate deploy` + `yarn start` |
| Host prod sunucusu | `yarn build && yarn start` | `.env` içinde `NODE_ENV=production` gerekmez; `next start` yeterli |

Docker `full` için `.env`’de `NEXT_PUBLIC_API_URL` ve `NEXTAUTH_URL` mutlaka `http://localhost:3000` olmalı (aksi halde build prod URL’leri gömer). Ayrıntı: [kök README](../README.md#prod-testi-local).

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

## Veritabanı ve migration'lar

Özet ve monorepo bağlamı: [kök README — Blog veritabanı ve migration'lar](../README.md#blog-veritabanı-ve-migrationlar).

### Geliştirme (local)

`yarn generate-local` → `prisma generate` + `db push` + seed. Hızlı iterasyon için uygundur.

### Üretim — normal akış (baseline sonrası)

Şema değişikliği eklerken migration dosyası üretin, ardından üretime deploy edin:

```bash
# Geliştirme: yeni migration oluştur
npx prisma migrate dev --name aciklayici_isim

# Üretim (Neon): sadece bekleyen migration'ları uygula
yarn db:migrate:deploy
# veya: yarn generate-prod   # generate + migrate deploy
```

Docker üretim girişinde (`docker-entrypoint.sh`) zaten `prisma migrate deploy` çalışır.

### P3005 — neden oluyor?

Üretim veritabanı ilk kurulumda `db push` ile oluşturulduysa `_prisma_migrations` geçmişi yoktur veya migration dosyalarıyla uyumsuzdur. Bu durumda `migrate deploy` şu hatayı verir:

```text
Error: P3005
The database schema is not empty.
```

**Kalıcı çözüm (tek seferlik baseline):** Mevcut şemanın `prisma/migrations` altındaki tüm migration'larla uyumlu olduğundan emin olun, sonra geçmişi işaretleyin:

```powershell
cd blog
$env:POSTGRES_PRISMA_URL = "<neon-pooler-url>"
# Mümkünse migrate için doğrudan bağlantı (pgbouncer olmadan):
# $env:POSTGRES_URL_NON_POOLING = "<neon-direct-url>"

yarn db:baseline --force
yarn db:migrate:deploy
```

İş bitince oturumdaki geçici URL’leri kaldırın ([Oturum değişkenlerini temizleme](#oturum-değişkenlerini-temizleme)).

Bundan sonra yeni özellikler için `migrate dev` + `migrate deploy` kullanın; üretimde `db push` ile şema güncellemeyin (drift ve P3005 tekrarlar).

### Acil durum — `migrate deploy` çalışmıyorsa (`db push`)

Baseline yapılmadan veya migration geçmişi henüz düzeltilmeden şemayı hızlıca eşitlemek için (veri kaybı riski — dikkatli kullanın):

```powershell
cd blog
$env:POSTGRES_PRISMA_URL = "<neon-pooler-url>"

npx prisma db push --accept-data-loss
```

İş bitince oturumdaki geçici URL’leri kaldırın ([Oturum değişkenlerini temizleme](#oturum-değişkenlerini-temizleme)).

Bu yol şemayı `schema.prisma` ile hizalar ancak migration geçmişini düzeltmez; kalıcı çözüm yine `yarn db:baseline --force` sonrası `migrate deploy` akışıdır.

### Oturum değişkenlerini temizleme

Neon veya prod DB URL’lerini yalnızca geçici olarak shell oturumuna verdiyseniz, komutlar bittikten sonra kaldırın. `blog/.env` içindeki kalıcı değerler değişmez.

**Windows (PowerShell)**

```powershell
Remove-Item Env:\POSTGRES_PRISMA_URL -ErrorAction SilentlyContinue
Remove-Item Env:\POSTGRES_URL_NON_POOLING -ErrorAction SilentlyContinue
```

**Windows (CMD)**

```cmd
set POSTGRES_PRISMA_URL=
set POSTGRES_URL_NON_POOLING=
```

**Linux / macOS (bash, zsh, Git Bash)**

```bash
unset POSTGRES_PRISMA_URL
unset POSTGRES_URL_NON_POOLING
```

**fish**

```fish
set -e POSTGRES_PRISMA_URL
set -e POSTGRES_URL_NON_POOLING
```

## Seed admin (geliştirme)

`yarn seed` sonrası: `admin@admin.com` / `1234asdf` (sadece dev ortamı).

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
