/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove output: 'export' as it doesn't support ISR
  // Configure trailing slash for better SEO
  trailingSlash: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
    disableStaticImages: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizeCss: true,
    scrollRestoration: true,
  },
}

module.exports = nextConfig
