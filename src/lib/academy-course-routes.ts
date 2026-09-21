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
  "demandes-clients-cabinet-comptable",
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

export const ARCHIVED_ACADEMY_DESTINATION = "/academie";

export const ACADEMY_PERMANENT_REDIRECTS = [
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
    source: "/cours",
    destination: ARCHIVED_ACADEMY_DESTINATION,
    permanent: true,
  },
  {
    source: "/cours/:path*",
    destination: ARCHIVED_ACADEMY_DESTINATION,
    permanent: true,
  },
  {
    source: "/academy",
    destination: "/academie",
    permanent: true,
  },
  {
    source: "/academy/:path*",
    destination: "/academie",
    permanent: true,
  },
  {
    source: "/organiser",
    destination: "/academie",
    permanent: true,
  },
  {
    source: "/organiser/piloter-sa-tresorerie",
    destination: "/academie/piloter-sa-tresorerie",
    permanent: true,
  },
  {
    source: "/organiser/comprendre-chiffre-affaires-benefice",
    destination: "/academie/comprendre-chiffre-affaires-benefice",
    permanent: true,
  },
  {
    source: "/organiser/fixer-ses-prix-sans-vendre-a-perte",
    destination: "/academie/fixer-ses-prix-sans-vendre-a-perte",
    permanent: true,
  },
  {
    source: "/organiser/construire-systeme-marketing-vente",
    destination: "/academie/construire-systeme-marketing-vente",
    permanent: true,
  },
  {
    source: "/organiser/transformer-demande-en-client",
    destination: "/academie/transformer-demande-en-client",
    permanent: true,
  },
  {
    source: "/organiser/deleguer-sans-perdre-le-controle",
    destination: "/academie/deleguer-sans-perdre-le-controle",
    permanent: true,
  },
  {
    source: "/organiser/construire-offre-facile-a-acheter",
    destination: "/academie/construire-offre-facile-a-acheter",
    permanent: true,
  },
  {
    source: "/organiser/livrer-prestation-sans-tout-reinventer",
    destination: "/academie/livrer-prestation-sans-tout-reinventer",
    permanent: true,
  },
  {
    source: "/organiser/entreprise-rentable-sans-tresorerie",
    destination: "/academie/piloter-sa-tresorerie",
    permanent: true,
  },
  {
    source: "/organiser/difference-chiffre-affaires-benefice",
    destination: "/academie/comprendre-chiffre-affaires-benefice",
    permanent: true,
  },
  {
    source: "/organiser/transformer-une-demande-en-client",
    destination: "/academie/transformer-demande-en-client",
    permanent: true,
  },
] as const;

export type AcademyContentSlug = (typeof ACADEMY_CONTENT_SLUGS)[number];
