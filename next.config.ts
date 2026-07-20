import type { NextConfig } from "next";

const scriptSrcUnsafeEval =
  process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

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
      `script-src 'self' 'unsafe-inline'${scriptSrcUnsafeEval} https://www.googletagmanager.com https://connect.facebook.net https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://drive.google.com https://lh3.googleusercontent.com https://*.googleusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://api.stripe.com https://checkout.stripe.com https://api-adresse.data.gouv.fr",
      "frame-src https://js.stripe.com https://checkout.stripe.com https://embed.fillout.com",
      "form-action 'self' https://checkout.stripe.com",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  devIndicators: false,
  distDir: process.env.DEMAA_BUILD_DIST_DIR || '.next',
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  async redirects() {
    return [
      {
        source: '/assistant/success',
        destination: '/annuaire-services/recrutement-assistante-facturation',
        permanent: true,
      },
      {
        source: '/systemes/:slug',
        destination: '/kit-operationnel/:slug',
        permanent: true,
      },
      {
        source: '/kit-systeme/:slug',
        destination: '/kit-operationnel/:slug',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/tableau-de-pilotage-:slug',
        destination: '/kit-operationnel/:slug',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/assurance-pro',
        destination: '/annuaire-fournisseurs/orus',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/protection-juridique',
        destination: '/annuaire-fournisseurs/insify',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/grossiste-alimentaire',
        destination: '/annuaire-fournisseurs/transgourmet',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/fournisseur-boissons',
        destination: '/annuaire-fournisseurs/france-boissons',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/emballages-pro',
        destination: '/annuaire-fournisseurs/raja',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/terminal-paiement',
        destination: '/annuaire-fournisseurs/sumup',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/telephonie-pro',
        destination: '/annuaire-fournisseurs/onoff-business',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/energie-pro',
        destination: '/annuaire-fournisseurs/edf-entreprises',
        permanent: true,
      },
      {
        source: '/annuaire-fournisseurs/hygiene-nettoyage',
        destination: '/annuaire-fournisseurs/bernard',
        permanent: true,
      },
      {
        source: '/academy/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/annuaire-newsletters/:newsletterSlug/:articleSlug',
        destination: '/annuaire-newsletters/:newsletterSlug',
        permanent: true,
      },
      {
        source: '/newsletters-a-valider',
        destination: '/annuaire-newsletters',
        permanent: true,
      },
      {
        source: '/newsletters-a-valider/:newsletterSlug/:articleSlug',
        destination: '/annuaire-newsletters/:newsletterSlug',
        permanent: true,
      },
      {
        source: '/ressources/obligations-tpe',
        destination: '/cours/obligations-finances-entreprise',
        permanent: true,
      },
      {
        source: '/ressources/obligations-tpe-template',
        destination: '/cours/obligations-finances-entreprise',
        permanent: true,
      },
      {
        source: '/ressources/previsionnel-financier',
        destination: '/modeles-de-documents/suivi-previsionnel-financier',
        permanent: true,
      },
      {
        source: '/ressources/suivi-previsionnel-financier-template',
        destination: '/modeles-de-documents/suivi-previsionnel-financier',
        permanent: true,
      },
      {
        source: '/ressources/systeme-operationnel-airtable',
        destination: '/modeles-de-documents/systeme-operationnel',
        permanent: true,
      },
      {
        source: '/ressources/systeme-operationnel-template',
        destination: '/modeles-de-documents/systeme-operationnel',
        permanent: true,
      },
      {
        source: '/documents-structuration/:slug',
        destination: '/plans-organisation/:slug',
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
