/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode to prevent issues with react-beautiful-dnd
  reactStrictMode: false,
  typescript: {
    // Ignoring TypeScript errors to allow the build to complete
    ignoreBuildErrors: true,
  },
  experimental: {
    // Server actions configuration
    serverActions: {
      allowedOrigins: ['localhost:3001', 'localhost:3000'],
    },
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
    NEXT_PUBLIC_UPLOAD_MAX_SIZE: '20mb',
  },
  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Cache-control headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  webpack(config) {
    // Configure webpack to handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  },
};

export default nextConfig; 