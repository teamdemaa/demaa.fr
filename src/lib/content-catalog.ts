export const CONTENT_CATEGORIES = ["Gestion & conformité"] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

export type ContentSource = Readonly<{
  label: string;
  href: string;
}>;

export type ContentArticleSection = Readonly<{
  heading: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
}>;

export type ContentCatalogEntry = Readonly<{
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  category: ContentCategory;
  tags: readonly string[];
  status: "draft" | "published";
  publishedAt: string;
  updatedAt: string;
  verifiedAt: string;
  relatedSystemSlugs: readonly string[];
  academyFundamentalSlugs: readonly string[];
  media: Readonly<{
    slides?: readonly string[];
    youtubeId?: string;
    youtubeThumbnail?: string;
    duration?: string;
  }>;
  keyPoints: readonly string[];
  article: readonly ContentArticleSection[];
  sources: readonly ContentSource[];
}>;

const FACTURATION_ELECTRONIQUE_SLIDES = Array.from(
  { length: 9 },
  (_, index) => `/images/courses/facturation-electronique/${String(index + 1).padStart(2, "0")}.png`,
);

const contentCatalog = [
  {
    slug: "facturation-electronique",
    title: "Facturation électronique : comprendre la réforme et préparer son entreprise",
    shortTitle: "La facturation électronique",
    summary:
      "Le calendrier 2026-2027, la différence entre e-invoicing et e-reporting, et les vérifications à mener sur vos outils, votre plateforme et vos données.",
    category: "Gestion & conformité",
    tags: [
      "facturation électronique",
      "e-invoicing",
      "e-reporting",
      "plateforme agréée",
      "TVA",
      "gestion",
    ],
    status: "published",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-09",
    verifiedAt: "2026-08-09",
    relatedSystemSlugs: [],
    academyFundamentalSlugs: [],
    media: {
      slides: FACTURATION_ELECTRONIQUE_SLIDES,
    },
    keyPoints: [
      "Toutes les entreprises concernées doivent pouvoir recevoir des factures électroniques à partir du 1er septembre 2026.",
      "Les PME et micro-entreprises devront émettre leurs factures électroniques et transmettre leurs données de e-reporting à partir du 1er septembre 2027.",
      "Un PDF ordinaire envoyé par e-mail ne répond pas, à lui seul, au nouveau circuit réglementaire.",
      "La première action consiste à vérifier la compatibilité de vos outils et le choix de votre plateforme agréée.",
    ],
    article: [
      {
        heading: "Ce que la réforme change réellement",
        paragraphs: [
          "La réforme ne consiste pas seulement à remplacer le papier par un fichier PDF. Elle modifie le circuit de transmission des factures et de certaines données à l’administration. Les entreprises concernées devront passer par une plateforme agréée, directement ou par l’intermédiaire d’une solution compatible.",
          "Une facture électronique est un document structuré, transmis dans un format normé. Un PDF ordinaire envoyé par e-mail ne suffira donc plus pour les opérations soumises à l’obligation de facturation électronique.",
        ],
      },
      {
        heading: "Pourquoi ce nouveau fonctionnement",
        paragraphs: [
          "Le dispositif vise à standardiser les échanges, faciliter le suivi des statuts de facture, réduire les ressaisies et mieux détecter les incohérences de TVA. Pour une entreprise, l’enjeu concret est surtout de disposer d’un circuit plus traçable, avec des données clients et fournisseurs suffisamment fiables.",
        ],
      },
      {
        heading: "Les deux échéances à retenir",
        items: [
          "1er septembre 2026 : toutes les entreprises concernées doivent être capables de recevoir des factures électroniques. Les grandes entreprises et les entreprises de taille intermédiaire doivent aussi les émettre et transmettre leur e-reporting.",
          "1er septembre 2027 : les PME et micro-entreprises doivent à leur tour émettre leurs factures électroniques et transmettre les données de e-reporting attendues.",
        ],
      },
      {
        heading: "E-invoicing et e-reporting : deux mécanismes différents",
        paragraphs: [
          "L’e-invoicing concerne principalement les factures entre entreprises établies en France et assujetties à la TVA, lorsque l’opération entre dans le champ de la réforme. La facture circule alors entre plateformes agréées.",
          "L’e-reporting correspond à la transmission de données de transaction ou de paiement pour les opérations qui ne passent pas par ce circuit, notamment certaines ventes à des particuliers ou à des clients établis à l’étranger. La facture peut continuer à être adressée au client par le canal habituel, tandis que les données requises sont transmises à l’administration.",
        ],
      },
      {
        heading: "Le nouveau flux au quotidien",
        items: [
          "Vous créez la facture dans votre logiciel ou directement sur une plateforme agréée.",
          "La facture est contrôlée et transmise à la plateforme du client lorsqu’elle relève de l’e-invoicing.",
          "Les données prévues par la réforme sont transmises à l’administration.",
          "Vous suivez les statuts de la facture dans votre outil ou sur la plateforme : dépôt, réception, traitement et paiement selon les informations disponibles.",
          "Vous centralisez également la réception des factures fournisseurs sur la plateforme choisie.",
        ],
      },
      {
        heading: "Vérifier vos outils et votre plateforme",
        paragraphs: [
          "Commencez par demander à votre éditeur de logiciel de facturation, de caisse ou de comptabilité comment il se connectera à une plateforme agréée. Vérifiez ensuite qui crée les factures, qui contrôle les données, qui suit les rejets et qui traite les factures fournisseurs.",
          "Une solution dite compatible peut conserver son rôle dans votre organisation, mais seule une plateforme agréée peut assurer les transmissions réglementaires prévues par la réforme. La liste officielle des plateformes est publiée et mise à jour par l’administration fiscale.",
        ],
      },
      {
        heading: "Fiabiliser les données avant la bascule",
        paragraphs: [
          "Le passage à la facturation électronique rend les erreurs de données plus visibles. Profitez de la préparation pour vérifier les identifiants de vos clients, leurs adresses de facturation, la nature des opérations, les règles de TVA appliquées et les coordonnées utilisées pour acheminer les factures.",
        ],
      },
      {
        heading: "La checklist à lancer maintenant",
        items: [
          "Lister les outils utilisés pour émettre, recevoir et comptabiliser les factures.",
          "Demander à chaque éditeur comment il gère la réforme et avec quelles plateformes agréées il fonctionne.",
          "Choisir la plateforme qui recevra les factures de l’entreprise.",
          "Nettoyer les données clients et fournisseurs essentielles.",
          "Définir le rôle de chaque personne en cas de rejet, d’écart ou de facture en attente.",
          "Tester le circuit complet avant votre échéance d’émission.",
        ],
      },
    ],
    sources: [
      {
      label: "Facturation électronique et plateformes agréées - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees",
      },
      {
      label: "Tout savoir sur la facturation électronique pour les entreprises - economie.gouv.fr",
        href: "https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises",
      },
      {
      label: "À partir de quand suis-je concerné ? - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation",
      },
      {
      label: "FAQ facturation électronique - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/foire-aux-questions-japprofondis-la-facturation-electronique",
      },
    ],
  },
] as const satisfies readonly ContentCatalogEntry[];

export function getContentFormat(entry: ContentCatalogEntry) {
  if (entry.media.youtubeId) return "Vidéo" as const;
  if (entry.media.slides?.length) return "Diaporama" as const;
  return "Article" as const;
}

export function getAllPublishedContent(): ContentCatalogEntry[] {
  return contentCatalog
    .filter((entry) => entry.status === "published")
    .map((entry) => ({ ...entry }))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function getPublishedContentBySlug(slug: string) {
  return getAllPublishedContent().find((entry) => entry.slug === slug) ?? null;
}
