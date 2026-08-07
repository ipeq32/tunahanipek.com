# Veritabanı yedekleme ve geri yükleme

## Ne işe yarar?

Haftalık Vercel Cron (`0 3 * * 0` UTC) iki şey üretir:

1. **Full DB yedeği** (`db-backup-YYYY-MM-DD`) — felaket kurtarma / restore
2. **Public snapshot** (`public-snapshot-latest`) — secret’sız okuma kopyası (blog, proje, dil, taxonomy, site owner). DB kapalıyken public GET’ler buradan beslenir.

Neon compute hours bitince admin/yazma yine çalışmaz; public sayfalar son snapshot ile okunur kalır. Full restore için yine yeni Postgres + dump gerekir.

## Otomatik yedek

| Öğe | Değer |
|-----|--------|
| Endpoint | `GET` / `POST` `/api/cron/db-backup` |
| Schedule | Pazar ~03:00 UTC (Hobby’de saat içinde kayabilir) |
| Auth | `Authorization: Bearer ${CRON_SECRET}` |
| Full saklama | Son 4 haftalık + ayın 1’i yedeklerinden son 3 |
| Son yedek | **En güncel full yedek asla silinmez** (DB uzun süre kapalı kalsa bile) |
| Public snapshot | Tek dosya; her başarılı yedekte üzerine yazılır; retention dokunmaz |

Not: DB kapalıyken Cron yeni yedek alamaz → prune de çalışmaz → mevcut yedekler zaten durur. Pin kuralı, ara sıra başarılı yedek + agresif budama olsa bile son dump’ın silinmesini engeller.

### Gerekli env (Vercel)

- `CRON_SECRET` — güçlü rastgele string; Vercel Cron bunu Bearer olarak gönderir
- `UPLOADTHING_TOKEN` — zaten kullanılıyor
- `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`

### Manuel tetikleme

```powershell
curl.exe -X POST "https://blog.tunahanipek.com/api/cron/db-backup" `
  -H "Authorization: Bearer $env:CRON_SECRET"
```

Başarıda `{ ok: true, customId, bytes, publicSnapshot, pruned, rowCounts }` döner.

## Yedeği indirme

1. UploadThing dashboard’da `db-backup-*.json.gz` veya `public-snapshot-latest.json.gz` bul, veya
2. Sunucuda `UTApi.getSignedURL(customId, { keyType: 'customId' })` kullan.

```bash
gunzip -k db-backup-YYYY-MM-DD.json.gz
# → db-backup-YYYY-MM-DD.json
```

## Geri yükleme (özet)

Prisma mantıksal dump kullanıldığı için `pg_restore` **yok**.

1. Yeni (veya boş) Postgres oluştur (Supabase / Neon yeni proje / VPS / Docker).
2. Hedef DB URL’lerini `.env` / Vercel’e yaz:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
3. Şemayı kur:

```bash
cd blog
yarn db:migrate:deploy
```

4. Dump’ı içe aktar:

```bash
yarn db:restore-backup path/to/db-backup-YYYY-MM-DD.json
```

Script tabloları FK sırasıyla `createMany` ile yazar; `_BlogToTag` / `_BlogToCategory` join’lerini ve Comment self-relation’ı iki geçişte bağlar.

5. Vercel’de env kaydet → redeploy (veya env-only restart).
6. `GET /api/health` ile `db: ok` doğrula.

## Notlar

- Full dump içinde API anahtarları, hash’lenmiş şifreler ve webhook secret’ları vardır; dosyayı gizli tut.
- Public snapshot’ta şifre / OAuth / AI key / webhook secret **yok**.
- UploadThing uygulama ayarında mümkünse dosyaları private tut; indirme için signed URL kullan.
- Aynı gün ikinci full yedek aynı `customId`’yi değiştirir (önce silinir, yeniden yüklenir).
- Neon compute tükenmişken Cron fail eder; UploadThing’teki son başarılı full yedek + public snapshot kalır.
