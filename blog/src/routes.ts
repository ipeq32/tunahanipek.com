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
} satisfies Pathnames<typeof locales>;
