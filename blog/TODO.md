# Blog — Yapılacaklar Listesi

Tüm maddeler tamamlandı. ✅

---

## P0 — Kritik düzeltmeler

- [x] API'de `user` alanını `author` olarak döndür
- [x] `IGetBlog` tipi ile API yanıtını hizala
- [x] Yayın akışı (rol bazlı otomatik yayın)
- [x] Quill HTML sanitizasyonu
- [x] Ölü menü linkleri giderildi

---

## P1 — Ürün tamamlama

### Blog CRUD

- [x] Blog düzenleme API
- [x] Blog silme API (soft delete)
- [x] Blog düzenleme sayfası
- [x] Blog silme onayı (admin)

### Admin paneli

- [x] `/admin/blog`
- [x] `/admin/project` (stub)
- [x] `/admin/comments` (yorum moderasyonu)
- [x] Proxy rol kontrolü
- [x] Blog ekleme API rol kontrolü

### Auth & profil

- [x] Şifremi unuttum + token akışı (`PasswordResetToken`, dev'de link loglanır)
- [x] `/auth/reset-password`
- [x] Profil sayfası
- [x] Ayarlar (profil + şifre)

### İçerik sayfaları

- [x] Anasayfa, Hakkımda, SSS, İletişim, Proje

### Şema ↔ uygulama (Seçenek A)

- [x] Yorum sistemi
- [x] Etiket (Tag) — form + filtreleme
- [x] Kategori (Category) — form + filtreleme

---

## P2 — SEO, performans, güvenlik, i18n

- [x] Metadata, sitemap, robots, RSS
- [x] Arama (`?q=`)
- [x] Etiket/kategori sayfaları (`/blog/tag/[name]`, `/blog/category/[name]`)
- [x] Prisma data layer
- [x] N+1 düzeltmesi
- [x] `revalidate = 60`
- [x] Root layout `force-dynamic` kaldırıldı
- [x] `next/image`
- [x] Login/register rate limiting
- [x] Zod validasyon, güvenlik header'ları, logger
- [x] i18n (`messages/tr.json`, `en.json`)

---

## P3 — Test, CI, dokümantasyon

- [x] Vitest (7 test)
- [x] Playwright e2e (`yarn test:e2e`)
- [x] GitHub Actions (lint, test, build)
- [x] README
- [x] `/api/health`
- [x] `docs/API.md`
- [x] Kod temizliği (seed, schema, recoil, vercel postgres)

---

## Veritabanı güncellemesi

Yeni `PasswordResetToken` modeli için:

```bash
cd blog
yarn prisma db push
# veya
yarn generate-local
```

---

## Sprint durumu

| Sprint | Durum |
|--------|--------|
| Sprint 1–6 | ✅ Tamamlandı |
