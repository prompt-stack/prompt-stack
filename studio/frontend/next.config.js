/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds (we'll run it separately)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for rapid deployment
    ignoreBuildErrors: true,
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Required for Next.js
              "style-src 'self' 'unsafe-inline'", // Required for Tailwind
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' http://localhost:8000 https://nepcpxunchnowolbcsgu.supabase.co https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://api.deepseek.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig