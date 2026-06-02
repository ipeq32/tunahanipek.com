# Blog — Yapılacaklar Listesi

Öncelik: **P0** (kritik) → **P1** (yüksek) → **P2** (orta) → **P3** (düşük / hijyen)

---

## P0 — Kritik düzeltmeler

- [x] API'de `user` alanını `author` olarak döndür (`/api/blog`, `/api/blog/[id]`)
- [x] `IGetBlog` tipi ile API yanıtını hizala
- [x] Yayın akışını netleştir: yeni yazılar `published: false` → admin onayı veya role göre otomatik yayın
- [x] Quill HTML çıktısını sanitize et (ör. DOMPurify) — `dangerouslySetInnerHTML` öncesi
- [x] Menüdeki ölü linkleri gider: sayfa ekle **veya** linkleri kaldır
  - [x] `/auth/forgot-password`
  - [x] `/profile`, `/setting`
  - [x] `/admin/blog`, `/admin/project`

---

## P1 — Ürün tamamlama

### Blog CRUD

- [x] Blog düzenleme API (PATCH/PUT)
- [x] Blog silme API (soft delete — `deletedAt`)
- [x] Blog düzenleme sayfası (`/blog/[id]/edit`)
- [x] Blog silme onayı (UI) — admin panelinde

### Admin paneli

- [x] `/admin/blog` — yazı listesi, onaylama/reddetme (`published` toggle)
- [x] `/admin/project` — proje yönetimi (veya menüden kaldır) — stub sayfa
- [x] Proxy'de admin rotalarına rol kontrolü (`SUPER_ADMIN`)
- [x] Blog ekleme API'sinde rol kontrolü

### Auth & profil

- [ ] Şifremi unuttum sayfası + akış (e-posta / token) — sayfa var, e-posta akışı yok
- [x] Profil sayfası (`/profile`)
- [x] Ayarlar sayfası (`/setting`) — profil + şifre güncelleme

### İçerik sayfaları

- [x] Anasayfa içeriği
- [x] Hakkımda (`/about-me`)
- [x] SSS (`/faq`)
- [x] İletişim (`/contact`)
- [x] Proje (`/project`)

---

## P1 — Şema ↔ uygulama

**Seçenek A — Uygula:**

- [ ] Yorum sistemi (listeleme, ekleme, moderasyon `PENDING/APPROVED/REJECTED`)
- [ ] Etiket (Tag) — yazıya ekleme, filtreleme
- [ ] Kategori (Category) — yazıya ekleme, filtreleme

**Seçenek B — Sadeleştir:**

- [ ] Kullanılmayan modelleri şemadan kaldır veya migration ile temizle

---

## P2 — SEO & keşfedilebilirlik

- [x] Yazı başına `generateMetadata` (title, description, OG image)
- [x] `sitemap.ts` — yayınlanmış yazı URL'lerini ekle
- [x] `robots.txt` geliştir (sitemap referansı)
- [x] RSS / Atom feed (`/feed.xml`)
- [x] Arama (başlık / özet / içerik)
- [ ] Etiket ve kategori sayfaları (filtreleme)

---

## P2 — Performans & mimari

- [x] Server Component'lerde self-HTTP fetch kaldır → doğrudan Prisma (`lib/data/blogs.ts`)
- [x] Blog listesi API'de N+1 sorguyu düzelt (`include: { author: true }`)
- [x] Uygun yerlerde cache / `revalidate` (blog listesi + detay: 60s)
- [ ] `force-dynamic` gereksiz kullanımını gözden geçir (root layout)
- [x] Blog görsellerinde `next/image` kullan
- [x] Sayfalama görünürlük mantığını düzelt (`isShowPagination`)
- [x] Her navigasyondaki ~1 sn yapay loading splash'i kaldır

---

## P2 — Güvenlik

- [x] Login / register API rate limiting
- [x] Kayıt API'sinde sunucu tarafı Zod validasyonu
- [x] Şifre politikası (min 6 karakter — Zod)
- [x] `next.config` güvenlik header'ları
- [x] `.env.template` — placeholder secret'lar
- [x] `console.error` yerine merkezi loglama

---

## P2 — i18n & UX

- [x] Hardcoded Türkçe metinleri `messages` dosyalarına taşı (blog, admin, sayfalar)
- [x] Add-blog form çevirileri (`Blog.Form`)
- [x] Blog kartlarında klavye erişilebilirliği
- [x] Görsellerde `alt` metinleri (blog title)

---

## P3 — Test, CI/CD & dokümantasyon

- [x] Vitest — sanitize, rate-limit, auth-roles testleri
- [ ] Playwright — kritik akışlar (giriş, yazı ekleme, listeleme)
- [x] `package.json`'a `test` script'i
- [x] GitHub Actions — lint, test, build
- [x] README — kurulum, env, Docker, seed admin
- [x] Health check endpoint (`/api/health`)

---

## P3 — Kod temizliği

- [x] Kullanılmayan `@vercel/postgres` bağımlılığını kaldır
- [x] Kullanılmayan Recoil auth atomlarını kaldır
- [x] `prisma/seed.ts` yorum bloklarını temizle
- [x] `prisma/schema.prisma` içindeki TODO / yorum bloklarını kaldır
- [ ] OpenAPI / basit API dokümantasyonu (isteğe bağlı)

---

## Önerilen sprint planı

| Sprint       | Odak                                              | Durum        |
| ------------ | ------------------------------------------------- | ------------ |
| **Sprint 1** | P0 tamamı                                         | ✅ Tamamlandı |
| **Sprint 2** | Admin paneli + yayın akışı + blog edit/delete     | ✅ Tamamlandı |
| **Sprint 3** | Stub sayfalar + profil/ayarlar                    | ✅ Tamamlandı |
| **Sprint 4** | SEO + performans refaktörü                        | ✅ Tamamlandı |
| **Sprint 5** | Yorumlar/etiketler **veya** şema sadeleştirme     | ⬜ Bekliyor   |
| **Sprint 6** | Test + CI + README                                | 🟡 Kısmen    |
