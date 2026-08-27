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

export function getAirtableEmbedUrl(destination: string): string | null {
  try {
    const parsed = new URL(destination);
    const publicBaseShare = parsed.pathname.match(
      /^\/(app[A-Za-z0-9]{14})\/(shr[A-Za-z0-9]{14})\/?$/,
    );

    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "airtable.com" ||
      !publicBaseShare
    ) {
      return null;
    }

    const [, baseId, shareId] = publicBaseShare;
    const embedUrl = new URL(`/embed/${baseId}/${shareId}`, parsed.origin);
    embedUrl.searchParams.set("backgroundColor", "gray");
    embedUrl.searchParams.set("viewControls", "on");

    return embedUrl.toString();
  } catch {
    return null;
  }
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
    featuredRank: 1,
  },
  {
    slug: "pilotage-marketing-vente",
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
    ctaHref: "https://airtable.com/appwUoJ0wXSR0GFrO/shrgjYyzwUNd8T5e0",
    tags: ["modele", "marketing", "vente", "pipeline", "airtable"],
    relatedSystemSlugs:
      RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG["pilotage-marketing-vente"] ??
      [],
    featuredRank: 2,
  },
  {
    slug: "interventions-et-chantiers",
    title: "Interventions et chantiers",
    seoTitle: "Suivi des interventions et chantiers | Modèle Airtable Demaa",
    description:
      "Une base Airtable prête à copier pour centraliser les demandes terrain, les sites, les équipes et le suivi des interventions.",
    seoDescription:
      "Copiez gratuitement un modèle Airtable pour organiser les demandes, les interventions, les équipes et le suivi terrain d’une PME.",
    content: `
## Pourquoi ce modèle existe

Dans beaucoup de PME de terrain, les demandes arrivent par téléphone, SMS, WhatsApp ou e-mail, puis se dispersent entre plusieurs personnes.

Ce modèle fournit un point de départ simple pour :

- centraliser les clients, les sites et les demandes ;
- transformer une demande qualifiée en intervention ;
- affecter une équipe et suivre les dates prévues ;
- conserver les comptes rendus et les prochaines actions ;
- retrouver l’historique sans reconstruire une application métier.

## Ce que vous allez trouver

- une table Clients et sites ;
- une table Demandes reliée aux sites ;
- une table Interventions reliée aux demandes ;
- une table Équipes ;
- une table Suivi terrain reliée aux interventions.

## Pour qui c’est utile

Ce modèle convient notamment aux entreprises du bâtiment, de maintenance, d’installation, de nettoyage et aux équipes qui planifient des interventions chez leurs clients.
    `.trim(),
    category: "Interventions & chantiers",
    date: "2026-08-27",
    ctaLabel: "Copier dans Airtable",
    ctaHref: "https://airtable.com/app0bcxfJ7Xs5cWnP/shrNvANFZlr1P503Q",
    tags: ["modele", "airtable", "intervention", "chantier", "terrain", "planning"],
    featuredRank: 4,
  },
  {
    slug: "projets-et-missions-clients",
    title: "Projets et missions clients",
    seoTitle: "Suivi des projets et missions clients | Modèle Airtable Demaa",
    description:
      "Une base Airtable prête à copier pour organiser les missions vendues, les étapes, les livrables, les responsables et les échéances client.",
    seoDescription:
      "Copiez gratuitement un modèle Airtable pour suivre les projets clients, les étapes, les livrables, les responsables et les échéances.",
    content: `
## Pourquoi ce modèle existe

Quand plusieurs missions avancent en parallèle, les échéances, les validations et les responsabilités se dispersent vite entre les échanges et les outils.

Ce modèle fournit un point de départ simple pour :

- centraliser les clients et les missions vendues ;
- découper chaque projet en étapes concrètes ;
- suivre les livrables et leur validation ;
- attribuer les responsabilités ;
- anticiper les échéances et les blocages.

## Ce que vous allez trouver

- une table Clients ;
- une table Projets ;
- une table Étapes ;
- une table Livrables ;
- une table Échéances.

## Pour qui c’est utile

Ce modèle convient notamment aux cabinets de conseil, agences, studios, bureaux d’études, freelances et entreprises qui réalisent plusieurs missions clients en parallèle.
    `.trim(),
    category: "Projets & missions",
    date: "2026-08-27",
    ctaLabel: "Copier dans Airtable",
    ctaHref: "https://airtable.com/app4IAGHfL6K0QyOV/shrMce04C1Vk0V83P",
    tags: ["modele", "airtable", "projet", "mission", "client", "livrable"],
    featuredRank: 3,
  },
  {
    slug: "suivi-administratif-et-echeances",
    title: "Suivi administratif et échéances",
    seoTitle: "Suivi administratif et échéances | Modèle Airtable Demaa",
    description:
      "Une base Airtable prête à copier pour suivre les dossiers administratifs, les échéances, les documents et les organismes.",
    seoDescription:
      "Copiez gratuitement un modèle Airtable pour centraliser les dossiers administratifs, les documents et les échéances d’une PME.",
    content: `
## Pourquoi ce modèle existe

Les obligations administratives se dispersent facilement entre les e-mails, les dossiers et les agendas individuels.

Ce modèle fournit un point de départ simple pour :

- centraliser les dossiers administratifs ;
- identifier la prochaine échéance ;
- attribuer un responsable ;
- relier les documents au bon dossier ;
- conserver les coordonnées des organismes concernés.

## Ce que vous allez trouver

- une table Dossiers administratifs ;
- une table Échéances ;
- une table Documents ;
- une table Organismes.

## Pour qui c’est utile

Ce modèle convient aux TPE et PME qui veulent réduire les oublis administratifs sans déployer un logiciel spécialisé.
    `.trim(),
    category: "Administration",
    date: "2026-08-27",
    ctaLabel: "Copier dans Airtable",
    ctaHref: "https://airtable.com/appsbJEsvc391xIJD/shrEhx6l2czuPQoZd",
    tags: ["modele", "airtable", "administratif", "echeance", "document"],
    featuredRank: 5,
  },
  {
    slug: "planning-marketing-et-contenus",
    title: "Planning marketing et contenus",
    seoTitle: "Planning marketing et contenus | Modèle Airtable Demaa",
    description:
      "Une base Airtable prête à copier pour planifier les campagnes, produire les contenus et suivre leurs résultats essentiels.",
    seoDescription:
      "Copiez gratuitement un modèle Airtable pour organiser les campagnes, les contenus, les publications et leurs performances.",
    content: `
## Pourquoi ce modèle existe

Les idées marketing, les validations et les dates de publication se perdent vite entre plusieurs documents et conversations.

Ce modèle fournit un point de départ simple pour :

- cadrer les campagnes et leurs objectifs ;
- planifier les contenus par canal et par format ;
- suivre leur production jusqu’à la publication ;
- attribuer les responsabilités ;
- relever les vues, les clics et les leads utiles.

## Ce que vous allez trouver

- une table Campagnes ;
- une table Contenus ;
- une table Performances.

## Pour qui c’est utile

Ce modèle convient aux petites équipes marketing, dirigeants, agences et indépendants qui veulent un calendrier éditorial partagé et lisible.
    `.trim(),
    category: "Marketing",
    date: "2026-08-27",
    ctaLabel: "Copier dans Airtable",
    ctaHref: "https://airtable.com/appb3KDll5vD7EXu9/shrvwILGqVkNP4ebH",
    tags: ["modele", "airtable", "marketing", "contenu", "planning"],
    featuredRank: 6,
  },
  {
    slug: "recrutement-et-candidatures",
    title: "Recrutement et candidatures",
    seoTitle: "Recrutement et candidatures | Modèle Airtable Demaa",
    description:
      "Une base Airtable prête à copier pour suivre les postes, les candidatures, les prochaines actions et les entretiens.",
    seoDescription:
      "Copiez gratuitement un modèle Airtable pour centraliser les postes, les candidatures et les entretiens d’une PME.",
    content: `
## Pourquoi ce modèle existe

Un recrutement devient difficile à piloter lorsque les candidatures, les échanges et les prochaines actions sont répartis entre plusieurs personnes.

Ce modèle fournit un point de départ simple pour :

- suivre les postes ouverts ;
- centraliser les candidatures ;
- voir l’étape et la prochaine action de chaque candidat ;
- planifier les entretiens ;
- conserver les comptes rendus utiles à la décision.

## Ce que vous allez trouver

- une table Postes ;
- une table Candidatures ;
- une table Entretiens.

## Pour qui c’est utile

Ce modèle convient aux PME qui recrutent ponctuellement et veulent un suivi commun sans mettre en place un outil RH complet.
    `.trim(),
    category: "Équipe",
    date: "2026-08-27",
    ctaLabel: "Copier dans Airtable",
    ctaHref: "https://airtable.com/appzBwl6kvGTViqEk/shrM3oTLflWU18TWK",
    tags: ["modele", "airtable", "recrutement", "candidature", "entretien"],
    featuredRank: 7,
  },
  {
    slug: "suivi-client-et-support",
    title: "Suivi client et demandes de support",
    seoTitle: "Suivi client et support | Modèle Airtable Demaa",
    description:
      "Une base Airtable prête à copier pour centraliser les clients, leurs demandes et les actions de suivi jusqu’à résolution.",
    seoDescription:
      "Copiez gratuitement un modèle Airtable pour centraliser, prioriser et résoudre les demandes de support client.",
    content: `
## Pourquoi ce modèle existe

Les demandes clients arrivent souvent par plusieurs canaux, ce qui complique leur attribution, leur suivi et leur résolution.

Ce modèle fournit un point de départ simple pour :

- centraliser les clients et leurs coordonnées ;
- enregistrer chaque demande reçue ;
- définir sa priorité, son statut et son responsable ;
- suivre les réponses, appels et relances ;
- conserver la résolution et l’historique utile.

## Ce que vous allez trouver

- une table Clients ;
- une table Demandes ;
- une table Actions de suivi.

## Pour qui c’est utile

Ce modèle convient aux petites équipes qui veulent structurer le support et le service après-vente sans adopter un outil de ticketing complexe.
    `.trim(),
    category: "Relation client",
    date: "2026-08-27",
    ctaLabel: "Copier dans Airtable",
    ctaHref: "https://airtable.com/appg5iRcrXgad8gmB/shrCpB4qLt5j29LNU",
    tags: ["modele", "airtable", "client", "support", "demande", "sav"],
    featuredRank: 8,
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
