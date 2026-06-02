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
- [ ] Blog düzenleme sayfası
- [x] Blog silme onayı (UI) — admin panelinde

### Admin paneli

- [x] `/admin/blog` — yazı listesi, onaylama/reddetme (`published` toggle)
- [x] `/admin/project` — proje yönetimi (veya menüden kaldır) — stub sayfa
- [x] Middleware'de admin rotalarına rol kontrolü (`ADMIN`, `SUPER_ADMIN`)
- [x] Blog ekleme API'sinde rol kontrolü

### Auth & profil

- [ ] Şifremi unuttum sayfası + akış (e-posta / token) — sayfa var, e-posta akışı yok
- [x] Profil sayfası (`/profile`)
- [ ] Ayarlar sayfası (`/setting`) — şifre, profil güncelleme — stub sayfa

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

- [x] Yazı başına `generateMetadata` (title, description, OG image)
- [x] `sitemap.ts` — yayınlanmış yazı URL'lerini ekle
- [x] `robots.txt` geliştir (sitemap referansı, gerekirse disallow)
- [x] RSS / Atom feed (`/feed.xml`)
- [ ] Arama (başlık / özet / içerik)
- [ ] Etiket ve kategori sayfaları (filtreleme)

---

## P2 — Performans & mimari

- [ ] Server Component'lerde self-HTTP fetch kaldır → doğrudan Prisma veya Server Actions
- [x] Blog listesi API'de N+1 sorguyu düzelt (`include: { author: true }`)
- [ ] Uygun yerlerde cache / `revalidate` (yayınlanmış yazılar için ISR düşün)
- [ ] `force-dynamic` gereksiz kullanımını gözden geçir
- [ ] Blog görsellerinde `next/image` kullan
- [x] Sayfalama görünürlük mantığını düzelt (`isShowPagination`)
- [x] Her navigasyondaki ~1 sn yapay loading splash'i kaldır veya sadeleştir

---

## P2 — Güvenlik

- [ ] Login / register API rate limiting
- [x] Kayıt API'sinde sunucu tarafı Zod validasyonu
- [x] Şifre politikası (min uzunluk, karmaşıklık) — min 6 karakter (Zod)
- [x] `next.config` güvenlik header'ları (CSP, HSTS, X-Frame-Options vb.)
- [x] `.env.template` — gerçek secret yerine placeholder
- [x] `console.error` yerine merkezi loglama (info/warn/error)

---

## P2 — i18n & UX

- [ ] Hardcoded Türkçe metinleri `messages/en.json` ve `tr.json`'a taşı
- [ ] Add-blog form placeholder'larını çeviriye al
- [x] Blog kartlarında klavye erişilebilirliği (`button` / `Link`, `onClick` on `h2` yerine)
- [ ] Eksik `alt` metinlerini tamamla

---

## P3 — Test, CI/CD & dokümantasyon

- [ ] Vitest — API ve yardımcı fonksiyon testleri
- [ ] Playwright — kritik akışlar (giriş, yazı ekleme, listeleme)
- [ ] `package.json`'a `test` script'i
- [ ] GitHub Actions — lint, build, typecheck (isteğe bağlı test)
- [x] README — kurulum, env değişkenleri, Docker profilleri, seed admin
- [x] Health check endpoint (`/api/health`)

---

## P3 — Kod temizliği

- [x] Kullanılmayan `@vercel/postgres` bağımlılığını kaldır
- [x] Kullanılmayan Recoil auth atomlarını kaldır veya kullan
- [ ] `prisma/seed.ts` yorum bloklarını temizle / seed'i genişlet
- [ ] `prisma/schema.prisma` içindeki TODO'yu çöz veya kaldır
- [ ] OpenAPI / basit API dokümantasyonu (isteğe bağlı)

---

## Önerilen sprint planı

| Sprint       | Odak                                              | Durum        |
| ------------ | ------------------------------------------------- | ------------ |
| **Sprint 1** | P0 tamamı                                         | ✅ Tamamlandı |
| **Sprint 2** | Admin paneli + yayın akışı + blog edit/delete     | 🟡 Kısmen    |
| **Sprint 3** | Stub sayfalar + profil/ayarlar                    | 🟡 Kısmen    |
| **Sprint 4** | SEO + performans refaktörü                        | 🟡 Kısmen    |
| **Sprint 5** | Yorumlar/etiketler **veya** şema sadeleştirme     | ⬜ Bekliyor   |
| **Sprint 6** | Test + CI + README                                | 🟡 Kısmen    |
