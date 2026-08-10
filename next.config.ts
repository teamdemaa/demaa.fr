import type { NextConfig } from "next";
import { buildContentSecurityPolicy } from "./src/lib/content-security-policy";
import { ACADEMY_PERMANENT_REDIRECTS } from "./src/lib/academy-course-routes";

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
    value: buildContentSecurityPolicy({
      allowUnsafeEval: process.env.NODE_ENV === "development",
    }),
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  devIndicators: false,
  distDir: process.env.DEMAA_BUILD_DIST_DIR || '.next',
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  async redirects() {
    return [
      ...ACADEMY_PERMANENT_REDIRECTS,
      {
        source: '/accompagnement',
        destination: '/',
        permanent: true,
      },
      {
        source: '/systemes-operationnels',
        destination: '/systemes',
        permanent: true,
      },
      {
        source: '/kits-operationnels',
        destination: '/systemes',
        permanent: true,
      },
      {
        source: '/rejoindre-le-reseau',
        destination: '/rejoindre-team-demaa',
        permanent: true,
      },
      {
        source: '/systeme-marketing',
        destination: '/services/marketing-vente',
        permanent: true,
      },
      {
        source: '/marketing-ethique',
        destination: '/services/marketing-vente',
        permanent: true,
      },
      {
        source: '/annuaire-services/expert-comptable',
        destination: '/services/expert-comptable',
        permanent: true,
      },
      {
        source: '/annuaire-services/marketing-vente',
        destination: '/services/marketing-vente',
        permanent: true,
      },
      {
        source: '/annuaire-services/marketing-externalise',
        destination: '/services/marketing-vente',
        permanent: true,
      },
      {
        source: '/annuaire-services/assistante-facturation',
        destination: '/services/assistance-facturation',
        permanent: true,
      },
      {
        source: '/annuaire-services/assistance-facturation',
        destination: '/services/assistance-facturation',
        permanent: true,
      },
      {
        source: '/annuaire-services/recrutement-assistante-facturation',
        destination: '/services/assistance-facturation',
        permanent: true,
      },
      {
        source: '/partenaires',
        destination: '/rejoindre-team-demaa',
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
        destination: '/systemes/:slug',
        permanent: true,
      },
      {
        source: '/kit-operationnel/:slug',
        destination: '/systemes/:slug',
        permanent: true,
      },
      {
        source: '/kit-systeme/:slug',
        destination: '/systemes/:slug',
        permanent: true,
      },
      {
        source: '/modeles-de-documents',
        destination: '/academie',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/tableau-de-pilotage-:slug',
        destination: '/systemes/:slug?tab=resources',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/suivi-previsionnel-financier',
        destination: '/academie/piloter-sa-tresorerie',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/pilotage-marketing-vente',
        destination: '/academie/construire-systeme-marketing-vente',
        permanent: true,
      },
      {
        source: '/modeles-de-documents/systeme-operationnel',
        destination: '/academie/construire-systeme-marketing-vente',
        permanent: true,
      },
      {
        source: '/plans-organisation/:slug',
        destination: '/systemes/:slug',
        permanent: true,
      },
      {
        source: '/documents-structuration/:slug',
        destination: '/systemes/:slug',
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
        source: '/ressources',
        destination: '/academie',
        permanent: true,
      },
      {
        source: '/ressources/obligations-tpe',
        destination: '/systemes',
        permanent: true,
      },
      {
        source: '/ressources/obligations-tpe-template',
        destination: '/systemes',
        permanent: true,
      },
      {
        source: '/ressources/previsionnel-financier',
        destination: '/academie/piloter-sa-tresorerie',
        permanent: true,
      },
      {
        source: '/ressources/suivi-previsionnel-financier-template',
        destination: '/academie/piloter-sa-tresorerie',
        permanent: true,
      },
      {
        source: '/ressources/systeme-operationnel-airtable',
        destination: '/academie/construire-systeme-marketing-vente',
        permanent: true,
      },
      {
        source: '/ressources/systeme-operationnel-template',
        destination: '/academie/construire-systeme-marketing-vente',
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
        destination: '/academie/construire-systeme-marketing-vente',
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
    ];
  },
};

export default nextConfig;
