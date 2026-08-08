import { RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG } from "@/lib/content-relationships";
import type { System } from "@/lib/types";
import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";
import rawOperationalSystemDemoAssets from "@/lib/operational-system-demo-assets.generated.json";

type EnterpriseSummary = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  icon: string;
  price: string;
};

const enterpriseCatalog = (rawEnterpriseAnnuaire as { enterprises: EnterpriseSummary[] }).enterprises;
const enterpriseCatalogBySlug = Object.fromEntries(
  enterpriseCatalog.map((enterprise) => [enterprise.slug, enterprise]),
);

function enterpriseToSystem(enterprise: EnterpriseSummary): System {
  return {
    id: enterprise.id,
    slug: enterprise.slug,
    name: enterprise.name,
    category: enterprise.category,
    description: enterprise.description,
    tags: enterprise.tags,
    icon: enterprise.icon,
    price: enterprise.price,
  };
}

export type DocumentModel = {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  seoDescription?: string;
  content: string;
  category: string;
  date: string;
  image?: string;
  slides?: string[];
  ctaLabel: string;
  ctaHref: string;
  tags: string[];
  relatedSystemSlugs?: string[];
  featuredRank?: number;
};

function getGoogleDriveFileId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  return match?.[1] ?? null;
}

export function getDocumentModelPreviewSrc(model: DocumentModel): string | null {
  const slidePreview = model.slides?.[0] ?? model.image;

  if (slidePreview) {
    return slidePreview;
  }

  const fileId = getGoogleDriveFileId(model.ctaHref);

  if (!fileId) {
    return null;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

const OPERATIONAL_SYSTEM_DEMO_URLS =
  rawOperationalSystemDemoAssets as Partial<Record<string, string>>;

export function getOperationalSystemDemoUrl(
  systemSlug: string,
): string | null {
  const sheetUrl = OPERATIONAL_SYSTEM_DEMO_URLS[systemSlug];

  if (!sheetUrl) {
    return null;
  }

  return sheetUrl.replace(/\/edit(?:\?.*)?$/, "/edit?usp=sharing");
}

const globalDocumentModels: DocumentModel[] = [
  {
    slug: "tableau-pilotage-operationnel",
    title: "Tableau de pilotage opérationnel",
    seoTitle: "Tableau de pilotage opérationnel pour TPE | Modèle Demaa",
    description: "Un tableau simple pour suivre les priorités, les actions et les résultats de votre activité.",
    content: "## Piloter l’essentiel\n\nUn modèle pour organiser les priorités, les actions et les indicateurs utiles à votre activité.",
    category: "Pilotage",
    date: "2026-08-08",
    image: "/images/levier/levier-tableau-de-bord-preview.webp",
    ctaLabel: "Ouvrir le modèle",
    ctaHref: "https://demaa.fr/api/systeme-kit/open/tableau-pilotage-operationnel",
    tags: ["modele", "pilotage", "tableau de bord"],
    featuredRank: 1,
  },
  {
    slug: "suivi-previsionnel-financier",
    title: "Suivi et prévisionnel financier",
    seoTitle: "Suivi et prévisionnel financier pour TPE | Modèle Demaa",
    description:
      "L'outil indispensable pour piloter votre trésorerie, le nerf de la guerre de toute entreprise.",
    seoDescription:
      "Téléchargez un modèle de suivi et prévisionnel financier pour TPE afin de piloter budget, trésorerie et anticipation plus sereinement.",
    content: `
## Pourquoi ce modèle existe

Dans beaucoup de petites entreprises, la trésorerie est pilotée trop tard.

On regarde le compte bancaire, on réagit au fil de l'eau, puis on découvre les tensions une fois qu'elles sont déjà là.

Ce modèle sert à remettre de l'anticipation :

- suivre les entrées et sorties importantes ;
- visualiser les postes de dépenses ;
- projeter les mois à venir ;
- arbitrer plus tôt ;
- protéger le cash avant qu'il ne manque.

## Ce que vous allez trouver

- une base de budget simple à adapter ;
- une lecture plus claire des postes fixes et variables ;
- un support utile pour prévoir, comparer et ajuster ;
- un document exploitable seul ou avec un expert-comptable.

## Pour qui c'est utile

Ce modèle est particulièrement utile si vous voulez :

- sortir d'un pilotage à vue ;
- mieux cadrer votre budget ;
- préparer un investissement ;
- rassurer un partenaire financier ;
- prendre des décisions plus tôt.
    `.trim(),
    category: "Finance",
    date: "2026-01-11",
    image: "/images/academy/budget-1.png",
    slides: [
      "/images/academy/budget-1.png",
      "/images/academy/budget-2.png",
      "/images/academy/budget-3.png",
    ],
    ctaLabel: "Ouvrir le modèle",
    ctaHref:
      "https://docs.google.com/spreadsheets/d/1-7IDhGAtwNQJtZDYYvhDvM3VHfHVeGwOMTFKdAQuIOE/edit?usp=sharing",
    tags: ["modele", "budget", "tresorerie", "finance"],
    relatedSystemSlugs:
      RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG["suivi-previsionnel-financier"] ??
      [],
    featuredRank: 2,
  },
  {
    slug: "crm-suivi-commercial",
    title: "CRM - suivi commercial",
    seoTitle: "CRM de suivi commercial pour TPE | Modèle Airtable Demaa",
    description:
      "Une base Airtable pour structurer votre pipeline commercial, vos relances et le suivi des conversions.",
    seoDescription:
      "Découvrez un modèle Airtable pour structurer le marketing et les ventes d'une TPE : pipeline, actions, relances et conversions.",
    content: `
## Pourquoi ce modèle existe

Beaucoup d'entreprises multiplient les actions commerciales sans vision claire des opportunités, des relances et des conversions.

Ce modèle sert à poser une base concrète pour :

- centraliser les prospects et les opportunités ;
- organiser les actions marketing et commerciales ;
- planifier les relances ;
- suivre les étapes du pipeline ;
- mesurer les conversions.

## Ce que vous allez trouver

- une structure Airtable simple à adapter ;
- un pipeline commercial lisible ;
- un suivi des actions et des relances ;
- une base commune pour piloter Marketing & Vente.

## Pour qui c'est utile

Ce modèle est particulièrement utile si vous voulez :

- arrêter de perdre des opportunités faute de relance ;
- rendre votre acquisition plus régulière ;
- mieux suivre la conversion ;
- partager un pipeline clair avec votre équipe ;
- piloter les prochaines actions commerciales.
    `.trim(),
    category: "Marketing & Vente",
    date: "2026-02-12",
    image: "/images/academy/organisation-1.png",
    slides: [
      "/images/academy/organisation-1.png",
      "/images/academy/organisation-2.png",
      "/images/academy/organisation-3.png",
    ],
    ctaLabel: "Ouvrir le modèle",
    ctaHref: "https://airtable.com/app3fRlYVjiFAnrjW/shraiL72hO4EvQoh2",
    tags: ["modele", "marketing", "vente", "pipeline", "airtable"],
    relatedSystemSlugs:
      RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG["pilotage-marketing-vente"] ??
      [],
    featuredRank: 3,
  },
];

const documentModels: DocumentModel[] = [...globalDocumentModels];

function compareDocumentModels(left: DocumentModel, right: DocumentModel) {
  const leftRank = left.featuredRank ?? 999;
  const rightRank = right.featuredRank ?? 999;

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return left.title.localeCompare(right.title, "fr");
}

export function getAllDocumentModels(): DocumentModel[] {
  return [...globalDocumentModels].sort(compareDocumentModels);
}

export function getDocumentModelBySlug(slug: string): DocumentModel | null {
  return documentModels.find((model) => model.slug === slug) ?? null;
}

export function getRelatedSystemsForDocumentModelSlug(slug: string, limit = 6): System[] {
  const model = getDocumentModelBySlug(slug);

  if (!model?.relatedSystemSlugs?.length) {
    return [];
  }

  return Array.from(new Set(model.relatedSystemSlugs))
    .map((systemSlug) => enterpriseCatalogBySlug[systemSlug])
    .filter((enterprise): enterprise is NonNullable<typeof enterprise> => Boolean(enterprise))
    .slice(0, limit)
    .map(enterpriseToSystem);
}
