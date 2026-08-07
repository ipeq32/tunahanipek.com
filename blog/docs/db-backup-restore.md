# Veritabanı yedekleme ve geri yükleme

## Ne işe yarar?

Haftalık Vercel Cron (`0 3 * * 0` UTC) Neon/Postgres içeriğini JSON olarak alır, gzip’ler ve UploadThing’e `db-backup-YYYY-MM-DD` customId ile yükler.

Bu bir **felaket kurtarma** yedeğidir. Neon compute hours bitince site yine düşer; son yedekten başka bir Postgres’e restore edip Vercel env’lerini güncelleyerek geri açarsın.

## Otomatik yedek

| Öğe | Değer |
|-----|--------|
| Endpoint | `GET` / `POST` `/api/cron/db-backup` |
| Schedule | Pazar ~03:00 UTC (Hobby’de saat içinde kayabilir) |
| Auth | `Authorization: Bearer ${CRON_SECRET}` |
| Saklama | Son 4 haftalık + ayın 1’i yedeklerinden son 3 |

### Gerekli env (Vercel)

- `CRON_SECRET` — güçlü rastgele string; Vercel Cron bunu Bearer olarak gönderir
- `UPLOADTHING_TOKEN` — zaten kullanılıyor
- `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`

### Manuel tetikleme

```bash
curl -X POST "https://<blog-domain>/api/cron/db-backup" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Başarıda `{ ok: true, customId, bytes, pruned, rowCounts }` döner.

## Yedeği indirme

1. UploadThing dashboard’da `db-backup-*.json.gz` dosyasını bul, veya
2. Sunucuda `UTApi.listFiles` / `generateSignedURL` ile `customId` üzerinden signed URL al.

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

- Dump içinde API anahtarları, hash’lenmiş şifreler ve webhook secret’ları vardır; dosyayı gizli tut.
- UploadThing uygulama ayarında mümkünse dosyaları private tut; indirme için signed URL kullan.
- Aynı gün ikinci yedek aynı `customId`’yi değiştirir (önce silinir, yeniden yüklenir).
- Neon compute tükenmişken Cron fail eder; UploadThing’teki son başarılı yedek kalır.
