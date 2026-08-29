import type { NextConfig } from "next";
import { buildContentSecurityPolicy } from "./src/lib/content-security-policy.ts";
import { ACADEMY_PERMANENT_REDIRECTS } from "./src/lib/academy-course-routes.ts";

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
    value: 'camera=(), microphone=(self), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: buildContentSecurityPolicy({
      allowUnsafeEval: process.env.NODE_ENV === "development",
    }),
  },
];

const firebaseAuthHelperHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
const firebaseAuthHelperOrigin = firebaseAuthHelperHost
  && /^[a-z0-9-]+\.firebaseapp\.com$/i.test(firebaseAuthHelperHost)
  ? `https://${firebaseAuthHelperHost}`
  : null;
const firebaseAuthHelperHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Content-Security-Policy',
    value: buildContentSecurityPolicy({
      allowSameOriginFraming: true,
      allowUnsafeEval: process.env.NODE_ENV === "development",
    }),
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  devIndicators: false,
  distDir: process.env.DEMAA_BUILD_DIST_DIR || '.next',
  // Firebase Admin 14 depends on jwks-rsa 4 (CommonJS) which loads jose 6
  // (ESM). Bundle the chain so Vercel does not execute that edge as a native
  // CommonJS require at runtime.
  transpilePackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  async rewrites() {
    return firebaseAuthHelperOrigin
      ? [
        {
          source: '/__/auth/:path*',
          destination: `${firebaseAuthHelperOrigin}/__/auth/:path*`,
        },
      ]
      : [];
  },
  async redirects() {
    return [
      ...ACADEMY_PERMANENT_REDIRECTS,
      {
        source: '/mon-espace',
        destination: '/plans/latest',
        permanent: true,
      },
      {
        source: '/mon-espace/plans/:id',
        destination: '/plans/:id',
        permanent: true,
      },
      {
        source: '/accompagnement',
        destination: '/automatisation',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/automatisation',
        permanent: true,
      },
      {
        source: '/services/automatisation-processus',
        destination: '/automatisation',
        permanent: true,
      },
      {
        source: '/sur-mesure',
        destination: '/automatisation',
        permanent: true,
      },
      {
        source: '/solutions/mentorat-automatisation-ia',
        destination: '/automatisation',
        permanent: true,
      },
      {
        source: '/systemes',
        destination: '/solutions',
        permanent: true,
      },
      {
        source: '/systemes/:slug',
        destination: '/solutions/:slug',
        permanent: true,
      },
      {
        source: '/systemes-operationnels',
        destination: '/solutions',
        permanent: true,
      },
      {
        source: '/kits-operationnels',
        destination: '/solutions',
        permanent: true,
      },
      {
        source: '/rejoindre-le-reseau',
        destination: '/opportunites?intent=team-demaa-profile',
        permanent: true,
      },
      {
        source: '/rejoindre-team-demaa',
        destination: '/opportunites?intent=team-demaa-profile',
        permanent: true,
      },
      {
        source: '/systeme-marketing',
        destination: '/services/coach-business',
        permanent: true,
      },
      {
        source: '/marketing-ethique',
        destination: '/services/coach-business',
        permanent: true,
      },
      {
        source: '/annuaire-services/expert-comptable',
        destination: '/annuaire-experts-comptables',
        permanent: true,
      },
      {
        source: '/services/expert-comptable',
        destination: '/annuaire-experts-comptables',
        permanent: true,
      },
      {
        source: '/annuaire-services/marketing-vente',
        destination: '/services/coach-business',
        permanent: true,
      },
      {
        source: '/annuaire-services/marketing-externalise',
        destination: '/services/coach-business',
        permanent: true,
      },
      {
        source: '/services/marketing-vente',
        destination: '/services/coach-business',
        permanent: true,
      },
      {
        source: '/partenaires',
        destination: '/opportunites?intent=team-demaa-profile',
        permanent: true,
      },
      {
        source: '/systemes-operationnels/:slug/recapitulatif',
        destination: '/systemes/:slug/recapitulatif',
        permanent: true,
      },
      {
        source: '/kit-operationnel/:slug/recapitulatif',
        destination: '/systemes/:slug/recapitulatif',
        permanent: true,
      },
      {
        source: '/kit-systeme/:slug/recapitulatif',
        destination: '/systemes/:slug/recapitulatif',
        permanent: true,
      },
      {
        source: '/systemes-operationnels/:slug',
        destination: '/solutions/:slug',
        permanent: true,
      },
      {
        source: '/kit-operationnel/:slug',
        destination: '/solutions/:slug',
        permanent: true,
      },
      {
        source: '/kit-systeme/:slug',
        destination: '/solutions/:slug',
        permanent: true,
      },
      {
        source: '/modeles-de-documents',
        destination: '/modeles',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/tableau-de-pilotage-:slug',
        destination: '/modeles?metier=:slug',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/suivi-previsionnel-financier',
        destination: '/modeles/suivi-previsionnel-financier',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/pilotage-marketing-vente',
        destination: '/modeles',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/systeme-operationnel',
        destination: '/modeles',
        permanent: true,
      },
      {
        source: '/plans-organisation/:slug',
        destination: '/solutions/:slug',
        permanent: true,
      },
      {
        source: '/documents-structuration/:slug',
        destination: '/solutions/:slug',
        permanent: true,
      },
      {
        source: '/offres-partenaires',
        destination: '/',
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
        source: '/ressources',
        destination: '/organiser',
        permanent: true,
      },
      {
        source: '/ressources/obligations-tpe',
        destination: '/solutions',
        permanent: true,
      },
      {
        source: '/ressources/obligations-tpe-template',
        destination: '/solutions',
        permanent: true,
      },
      {
        source: '/ressources/previsionnel-financier',
        destination: '/modeles/suivi-previsionnel-financier',
        permanent: true,
      },
      {
        source: '/ressources/suivi-previsionnel-financier-template',
        destination: '/modeles/suivi-previsionnel-financier',
        permanent: true,
      },
      {
        source: '/ressources/systeme-operationnel-airtable',
        destination: '/modeles',
        permanent: true,
      },
      {
        source: '/ressources/systeme-operationnel-template',
        destination: '/modeles',
        permanent: true,
      },
      {
        source: '/opportunites-b2b',
        destination: '/opportunites',
        permanent: true,
      },
      {
        source: '/opportunites/0034',
        destination: '/opportunites',
        permanent: true,
      },
      {
        source: '/cours/systeme-marketing-vente',
        destination: '/organiser/construire-systeme-marketing-vente',
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
        source: '/__/auth/:path*',
        headers: firebaseAuthHelperHeaders,
      },
    ];
  },
};

export default nextConfig;
