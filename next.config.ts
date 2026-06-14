import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://api.stripe.com https://checkout.stripe.com https://api-adresse.data.gouv.fr",
      "frame-src https://js.stripe.com https://checkout.stripe.com",
      "form-action 'self' https://checkout.stripe.com",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  async redirects() {
    return [
      {
        source: '/documents-structuration/:slug',
        destination: '/plans-organisation/:slug',
        permanent: true,
      },
      {
        source: '/services/structuration-automatisation',
        destination: '/services/organisation-automatisation',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
