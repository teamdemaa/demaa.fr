export const ACADEMY_CONTENT_SLUGS = [
  "piloter-sa-tresorerie",
  "comprendre-chiffre-affaires-benefice",
  "fixer-ses-prix-sans-vendre-a-perte",
  "construire-systeme-marketing-vente",
  "transformer-demande-en-client",
  "deleguer-sans-perdre-le-controle",
  "construire-offre-facile-a-acheter",
  "livrer-prestation-sans-tout-reinventer",
  "cabinet-conseil-acquisition",
  "maintenance-informatique-acquisition",
  "cabinet-recrutement-acquisition",
  "nettoyage-professionnel-acquisition",
  "formation-b2b-acquisition",
  "bureau-etudes-acquisition",
  "organiser-entreprise-plomberie",
  "organiser-demandes-devis-renovation",
  "organiser-chantier-menuiserie",
  "organiser-interventions-nettoyage",
  "organiser-parcours-client-garage",
  "organiser-commandes-stocks-restaurant",
  "organiser-suivi-administratif-formation",
  "organiser-mission-agence",
  "centraliser-demandes-telephone-sms-whatsapp",
  "organiser-planning-plusieurs-techniciens",
  "bon-intervention-facture-sans-ressaisie",
  "quel-logiciel-quand-excel-ne-suffit-plus",
  "rentabilite-application-metier",
  "logiciel-existant-ou-application-metier",
] as const;

export const LEGACY_ACADEMY_SLUG_ALIASES = {
  "entreprise-rentable-sans-tresorerie": "piloter-sa-tresorerie",
  "difference-chiffre-affaires-benefice":
    "comprendre-chiffre-affaires-benefice",
  "transformer-une-demande-en-client": "transformer-demande-en-client",
} as const;

export const ACADEMY_PERMANENT_REDIRECTS = [
  {
    source: "/cours",
    destination: "/organiser/processus",
    permanent: true,
  },
  {
    source: "/academy",
    destination: "/organiser/processus",
    permanent: true,
  },
  {
    source: "/academie",
    destination: "/organiser/processus",
    permanent: true,
  },
  ...ACADEMY_CONTENT_SLUGS.map((slug) => ({
    source: `/cours/${slug}`,
    destination: `/organiser/${slug}`,
    permanent: true,
  })),
  ...ACADEMY_CONTENT_SLUGS.map((slug) => ({
    source: `/academy/${slug}`,
    destination: `/organiser/${slug}`,
    permanent: true,
  })),
  ...ACADEMY_CONTENT_SLUGS.map((slug) => ({
    source: `/academie/${slug}`,
    destination: `/organiser/${slug}`,
    permanent: true,
  })),
  ...Object.entries(LEGACY_ACADEMY_SLUG_ALIASES).flatMap(
    ([legacySlug, canonicalSlug]) => [
      {
        source: `/cours/${legacySlug}`,
        destination: `/organiser/${canonicalSlug}`,
        permanent: true,
      },
      {
        source: `/academie/${legacySlug}`,
        destination: `/organiser/${canonicalSlug}`,
        permanent: true,
      },
      {
        source: `/academy/${legacySlug}`,
        destination: `/organiser/${canonicalSlug}`,
        permanent: true,
      },
      {
        source: `/organiser/${legacySlug}`,
        destination: `/organiser/${canonicalSlug}`,
        permanent: true,
      },
    ],
  ),
  {
    source: "/cours/facture-electronique",
    destination: "/contenus/facturation-electronique",
    permanent: true,
  },
  {
    source: "/cours/obligations-finances-entreprise",
    destination: "/solutions",
    permanent: true,
  },
  {
    source: "/cours/organisation-marketing-vente",
    destination: "/organiser/construire-systeme-marketing-vente",
    permanent: true,
  },
] as const;

export type AcademyContentSlug = (typeof ACADEMY_CONTENT_SLUGS)[number];
