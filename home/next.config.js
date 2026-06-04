const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  /** Docker bind-mount: avoid tracing parent monorepo and stale vendor chunks */
  outputFileTracingRoot: require("path").join(__dirname),
};

module.exports = withNextIntl(nextConfig);
