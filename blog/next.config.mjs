import createNextIntlPlugin from 'next-intl/plugin';
import { DeleteSourceMapsPlugin } from 'webpack-delete-sourcemaps-plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.(mp3)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/sounds/',
          outputPath: 'static/sounds/',
          name: '[name].[ext]',
          esModule: false,
        },
      },
    });
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
