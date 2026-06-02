import { Pathnames } from 'next-intl/routing';
import type { locales } from './config';

export default {
  '/': '/',
  '/auth': {
    en: '/auth',
    tr: '/yetkilendirme',
  },
  '/auth/login': {
    en: '/auth/login',
    tr: '/yetkilendirme/giris-yap',
  },
  '/auth/register': {
    en: '/auth/register',
    tr: '/yetkilendirme/kayit-ol',
  },
  '/auth/forgot-password': {
    en: '/auth/forgot-password',
    tr: '/yetkilendirme/sifremi-unuttum',
  },
  '/auth/reset-password': {
    en: '/auth/reset-password',
    tr: '/yetkilendirme/sifre-sifirla',
  },
  '/blog': {
    en: '/blog',
    tr: '/blog',
  },
  '/blog/[id]': {
    en: '/blog/[id]',
    tr: '/blog/[id]',
  },
  '/blog/add': {
    en: '/blog/add',
    tr: '/blog/ekle',
  },
  '/blog/[id]/edit': {
    en: '/blog/[id]/edit',
    tr: '/blog/[id]/duzenle',
  },
  '/blog/tag/[name]': {
    en: '/blog/tag/[name]',
    tr: '/blog/etiket/[name]',
  },
  '/blog/category/[name]': {
    en: '/blog/category/[name]',
    tr: '/blog/kategori/[name]',
  },
  '/about-me': {
    en: '/about-me',
    tr: '/hakkimda',
  },
  '/project': {
    en: '/project',
    tr: '/proje',
  },
  '/faq': {
    en: '/faq',
    tr: '/sss',
  },
  '/contact': {
    en: '/contact',
    tr: '/iletisim',
  },
  '/profile': {
    en: '/profile',
    tr: '/profil',
  },
  '/setting': {
    en: '/setting',
    tr: '/ayarlar',
  },
  '/admin/blog': {
    en: '/admin/blog',
    tr: '/admin/blog',
  },
  '/admin/project': {
    en: '/admin/project',
    tr: '/admin/proje',
  },
  '/admin/comments': {
    en: '/admin/comments',
    tr: '/admin/yorumlar',
  },
} satisfies Pathnames<typeof locales>;
