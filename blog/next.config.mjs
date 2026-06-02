import createNextIntlPlugin from 'next-intl/plugin';
import { DeleteSourceMapsPlugin } from 'webpack-delete-sourcemaps-plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
