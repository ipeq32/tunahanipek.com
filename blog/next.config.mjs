import createNextIntlPlugin from 'next-intl/plugin';
import { DeleteSourceMapsPlugin } from 'webpack-delete-sourcemaps-plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Report-only ile başlatıyoruz: ihlaller raporlanır ama içerik bloklanmaz.
 * `unsafe-inline`/`unsafe-eval`, Next.js runtime ve zengin metin için gereklidir;
 * tarayıcı testleriyle daraltıldıktan sonra `Content-Security-Policy`'ye geçirilebilir.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' https: http: data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https://*.ingest.uploadthing.com https://*.uploadthing.com https://*.ufs.sh https://utfs.io",
  'upgrade-insecure-requests',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    config.plugins.push(
      new DeleteSourceMapsPlugin({ isServer, keepServerSourcemaps: true })
    );
    return config;
  },
};

export default withNextIntl(nextConfig);
