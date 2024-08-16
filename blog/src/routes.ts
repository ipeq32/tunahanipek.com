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
  '/hello/tuna': {
    en: '/hello/tuna',
    tr: '/merhaba/tuna',
  },
} satisfies Pathnames<typeof locales>;
