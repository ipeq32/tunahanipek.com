# Blog API

Base URL: `NEXT_PUBLIC_API_URL` (ör. `http://localhost:3000`)

## Health

- `GET /api/health` — servis durumu

## Auth

- `POST /api/auth/register` — kayıt
- `POST /api/auth/forgot-password` — şifre sıfırlama token (dev’de `resetUrl` dönebilir)
- `POST /api/auth/reset-password` — `{ token, password, passwordConfirm }`
- `POST /api/auth/[...nextauth]` — NextAuth (giriş/çıkış)

## Blog

- `GET /api/blog?page&limit&q&tag&category` — yayınlanmış yazılar
- `GET /api/blog/[id]` — yazı detayı
- `POST /api/blog/add` — yazı oluştur (moderatör+, body: `tags`, `categories` virgüllü string)
- `PATCH /api/blog/[id]` — güncelle
- `DELETE /api/blog/[id]` — soft delete
- `GET /api/blog/admin` — tüm yazılar (SUPER_ADMIN)

## Yorumlar

- `GET /api/blog/[id]/comments` — onaylı yorumlar
- `POST /api/blog/[id]/comments` — yorum ekle (auth, `PENDING`)
- `GET /api/admin/comments` — bekleyen yorumlar (SUPER_ADMIN)
- `PATCH /api/admin/comments` — `{ id, status: APPROVED|REJECTED }`

## Kullanıcı

- `PATCH /api/user/profile` — profil güncelle
- `PATCH /api/user/password` — şifre değiştir

## Taksonomi

- `GET /api/tags`
- `GET /api/categories`
