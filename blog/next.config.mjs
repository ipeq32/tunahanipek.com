import createNextIntlPlugin from 'next-intl/plugin';
import { DeleteSourceMapsPlugin } from 'webpack-delete-sourcemaps-plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
