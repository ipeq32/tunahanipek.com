/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['https://img.icons8.com', 'https://images.unsplash.com'],
    unoptimized: true,
  },
}

module.exports = nextConfig
