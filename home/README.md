# Home (Landing)

`tunahanipek.com` ana tanıtım sayfası — Next.js 13.

## Gereksinimler

- Node.js 18+ (`.nvmrc`: v18.16.1)
- Yarn

## Kurulum

```bash
yarn install
yarn dev
```

- Yerel: `yarn dev` → http://localhost:3001
- Docker (`home-dev`): host **3001** → container içi **3000** (`docker compose --profile dev up`)

## Scriptler

| Komut | Açıklama |
|-------|----------|
| `yarn dev` | Geliştirme sunucusu |
| `yarn build` | Üretim derlemesi |
| `yarn start` | Üretim sunucusu |
| `yarn lint` | ESLint |

## Deploy

- Üretim URL: `https://tunahanipek.com`
- Blog: `https://blog.tunahanipek.com` ([`blog/`](../blog/) uygulaması)

Docker (repo kökü):

```bash
docker compose --profile full up home
```

## SEO

- `app/robots.ts`, `app/sitemap.ts`
- Dinamik `icon` ve `opengraph-image` (kod ile üretilir)
