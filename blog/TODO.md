# Blog — Yapılacaklar Listesi

Öncelik: **P0** (kritik) → **P1** (yüksek) → **P2** (orta) → **P3** (düşük / hijyen)

---

## P0 — Kritik düzeltmeler

- [ ] API'de `user` alanını `author` olarak döndür (`/api/blog`, `/api/blog/[id]`)
- [ ] `IGetBlog` tipi ile API yanıtını hizala
- [ ] Yayın akışını netleştir: yeni yazılar `published: false` → admin onayı veya role göre otomatik yayın
- [ ] Quill HTML çıktısını sanitize et (ör. DOMPurify) — `dangerouslySetInnerHTML` öncesi
- [ ] Menüdeki ölü linkleri gider: sayfa ekle **veya** linkleri kaldır
  - [ ] `/auth/forgot-password`
  - [ ] `/profile`, `/setting`
  - [ ] `/admin/blog`, `/admin/project`

---

## P1 — Ürün tamamlama

### Blog CRUD

- [ ] Blog düzenleme API (PATCH/PUT)
- [ ] Blog silme API (soft delete — `deletedAt`)
- [ ] Blog düzenleme sayfası
- [ ] Blog silme onayı (UI)

### Admin paneli

- [ ] `/admin/blog` — yazı listesi, onaylama/reddetme (`published` toggle)
- [ ] `/admin/project` — proje yönetimi (veya menüden kaldır)
- [ ] Middleware'de admin rotalarına rol kontrolü (`ADMIN`, `SUPER_ADMIN`)
- [ ] Blog ekleme API'sinde rol kontrolü

### Auth & profil

- [ ] Şifremi unuttum sayfası + akış (e-posta / token)
- [ ] Profil sayfası (`/profile`)
- [ ] Ayarlar sayfası (`/setting`) — şifre, profil güncelleme

### İçerik sayfaları

- [ ] Anasayfa içeriği (şu an sadece "Anasayfa")
- [ ] Hakkımda (`/about-me`)
- [ ] SSS (`/faq`)
- [ ] İletişim (`/contact`) — form veya iletişim bilgileri
- [ ] Proje (`/project`)

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

- [ ] Yazı başına `generateMetadata` (title, description, OG image)
- [ ] `sitemap.ts` — yayınlanmış yazı URL'lerini ekle
- [ ] `robots.txt` geliştir (sitemap referansı, gerekirse disallow)
- [ ] RSS / Atom feed (`/feed.xml`)
- [ ] Arama (başlık / özet / içerik)
- [ ] Etiket ve kategori sayfaları (filtreleme)

---

## P2 — Performans & mimari

- [ ] Server Component'lerde self-HTTP fetch kaldır → doğrudan Prisma veya Server Actions
- [ ] Blog listesi API'de N+1 sorguyu düzelt (`include: { author: true }`)
- [ ] Uygun yerlerde cache / `revalidate` (yayınlanmış yazılar için ISR düşün)
- [ ] `force-dynamic` gereksiz kullanımını gözden geçir
- [ ] Blog görsellerinde `next/image` kullan
- [ ] Sayfalama görünürlük mantığını düzelt (`isShowPagination`)
- [ ] Her navigasyondaki ~1 sn yapay loading splash'i kaldır veya sadeleştir

---

## P2 — Güvenlik

- [ ] Login / register API rate limiting
- [ ] Kayıt API'sinde sunucu tarafı Zod validasyonu
- [ ] Şifre politikası (min uzunluk, karmaşıklık)
- [ ] `next.config` güvenlik header'ları (CSP, HSTS, X-Frame-Options vb.)
- [ ] `.env.template` — gerçek secret yerine placeholder
- [ ] `console.error` yerine merkezi loglama (info/warn/error)

---

## P2 — i18n & UX

- [ ] Hardcoded Türkçe metinleri `messages/en.json` ve `tr.json`'a taşı
- [ ] Add-blog form placeholder'larını çeviriye al
- [ ] Blog kartlarında klavye erişilebilirliği (`button` / `Link`, `onClick` on `h2` yerine)
- [ ] Eksik `alt` metinlerini tamamla

---

## P3 — Test, CI/CD & dokümantasyon

- [ ] Vitest — API ve yardımcı fonksiyon testleri
- [ ] Playwright — kritik akışlar (giriş, yazı ekleme, listeleme)
- [ ] `package.json`'a `test` script'i
- [ ] GitHub Actions — lint, build, typecheck (isteğe bağlı test)
- [ ] README — kurulum, env değişkenleri, Docker profilleri, seed admin
- [ ] Health check endpoint (`/api/health`)

---

## P3 — Kod temizliği

- [ ] Kullanılmayan `@vercel/postgres` bağımlılığını kaldır
- [ ] Kullanılmayan Recoil auth atomlarını kaldır veya kullan
- [ ] `prisma/seed.ts` yorum bloklarını temizle / seed'i genişlet
- [ ] `prisma/schema.prisma` içindeki TODO'yu çöz veya kaldır
- [ ] OpenAPI / basit API dokümantasyonu (isteğe bağlı)

---

## Önerilen sprint planı

| Sprint       | Odak                                              |
| ------------ | ------------------------------------------------- |
| **Sprint 1** | P0 tamamı                                         |
| **Sprint 2** | Admin paneli + yayın akışı + blog edit/delete     |
| **Sprint 3** | Stub sayfalar + profil/ayarlar                    |
| **Sprint 4** | SEO + performans refaktörü                        |
| **Sprint 5** | Yorumlar/etiketler **veya** şema sadeleştirme     |
| **Sprint 6** | Test + CI + README                                |
