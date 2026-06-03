import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/config';

/**
 * Statik `robots.txt` ortam farkı gözetmediğinden (prod'da da `localhost`
 * yazıyordu) dinamik üretime geçtik. `host` değeri dağıtım ortamına göre
 * çözülür; böylece `Sitemap` her zaman doğru mutlak URL'i işaret eder.
 */
export default function robots(): MetadataRoute.Robots {
  const host = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Rotalar `[locale]` ile prefix'li olduğundan (`/en/admin` gibi) locale
      // joker'i kullanırız; `/api` ise locale'siz olduğu için ayrıca eklenir.
      disallow: [
        '/api/',
        '/*/auth/',
        '/*/admin/',
        '/*/setting',
        '/*/profile',
      ],
    },
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
