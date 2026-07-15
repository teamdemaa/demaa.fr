import "server-only";

import type { Metadata } from "next";
import { enterpriseToSystem, type EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import {
  buildOperationalSystemDetail,
  type OperationalSystemDetail,
} from "@/lib/system-operations";
import type { System } from "@/lib/types";

export type SystemDetailPageData = {
  enterprise: EnterpriseDefinition;
  system: System;
  detail: OperationalSystemDetail;
};

const SYSTEM_PAGE_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "cabinet-comptable":
    "Structurez un systeme de cabinet comptable avec dossiers, echeances, relances, outils utiles et ressources concretes.",
  "cabinet-davocat":
    "Organisez un systeme de cabinet d'avocat avec dossiers, pieces, audiences, outils utiles et ressources concretes.",
  "cabinet-de-conseil":
    "Cadrez un systeme de cabinet de conseil avec missions, livrables, suivi client, outils utiles et ressources concretes.",
  "agence-marketing":
    "Structurez un systeme d'agence marketing avec campagnes, livrables, clients, outils utiles et ressources concretes.",
  freelance:
    "Organisez un systeme de freelance B2B avec offres, missions, relances, outils utiles et ressources concretes.",
  "agence-web":
    "Cadrez un systeme d'agence web avec projets, livraisons, retours client, outils utiles et ressources concretes.",
  "creation-de-contenu":
    "Structurez un systeme de creation de contenu avec production, publication, revenus, outils utiles et ressources concretes.",
  marketplace:
    "Organisez un systeme de marketplace avec vendeurs, commandes, paiements, outils utiles et ressources concretes.",
  media:
    "Cadrez un systeme de media avec contenus, audience, partenariats, outils utiles et ressources concretes.",
  saas:
    "Structurez un systeme de SaaS avec acquisition, produit, support, outils utiles et ressources concretes.",
  batiment:
    "Organisez un systeme de batiment avec devis, chantiers, equipes, outils utiles et ressources concretes.",
  "agence-immobiliere":
    "Structurez un systeme d'agence immobiliere avec mandats, visites, signatures, outils utiles et ressources concretes.",
  "marchand-de-biens":
    "Cadrez un systeme de marchand de biens avec achats, travaux, revente, outils utiles et ressources concretes.",
  "investissement-locatif":
    "Organisez un systeme d'investissement locatif avec financement, loyers, travaux, outils utiles et ressources concretes.",
  "conciergerie-airbnb":
    "Structurez un systeme de conciergerie multi-biens avec reservations, menage, voyageurs, outils utiles et ressources concretes.",
  "investissement-immobilier":
    "Cadrez un systeme d'investissement immobilier avec biens, travaux, loyers, outils utiles et ressources concretes.",
  "investissement-financier":
    "Organisez un systeme d'investissement financier avec allocations, risques, frais, outils utiles et ressources concretes.",
  "investissement-entreprise":
    "Structurez un systeme d'investissement entreprise avec participations, risques, suivi, outils utiles et ressources concretes.",
  "livraison-dernier-kilometre":
    "Cadrez un systeme de livraison dernier kilometre avec tournees, delais, incidents, outils utiles et ressources concretes.",
  "transport-de-marchandise":
    "Organisez un systeme de transport de marchandises avec flotte, expeditions, marge, outils utiles et ressources concretes.",
  "transport-de-personnes":
    "Structurez un systeme de transport de personnes B2B avec reservations, trajets, chauffeurs, outils utiles et ressources concretes.",
  "production-industrie":
    "Organisez un systeme de production et industrie avec production, stocks, delais, outils utiles et ressources concretes.",
  "plomberie-chauffage":
    "Structurez un systeme de plomberie et chauffage avec urgences, devis, chantiers, outils utiles et ressources concretes.",
  "electricite-generale":
    "Cadrez un systeme d'electricite generale avec conformite, equipes, chantiers, outils utiles et ressources concretes.",
  "renovation-interieur":
    "Organisez un systeme de renovation interieure avec clients, chantiers, marge, outils utiles et ressources concretes.",
  "menuiserie-agencement":
    "Structurez un systeme de menuiserie et agencement avec atelier, pose, validations, outils utiles et ressources concretes.",
  "maconnerie-gros-oeuvre":
    "Cadrez un systeme de maconnerie et gros oeuvre avec planning, materiaux, equipes, outils utiles et ressources concretes.",
  paysagiste:
    "Organisez un systeme de paysagiste avec devis, chantiers, entretiens, outils utiles et ressources concretes.",
  "garage-automobile":
    "Structurez un systeme de garage automobile avec atelier, pieces, clients, outils utiles et ressources concretes.",
  carrosserie:
    "Cadrez un systeme de carrosserie avec sinistres, pieces, accords, outils utiles et ressources concretes.",
  "cabinet-medical":
    "Organisez un systeme de cabinet medical avec agenda, documents, suivis, outils utiles et ressources concretes.",
  "cabinet-paramedical":
    "Structurez un systeme de cabinet paramedical avec seances, facturation, suivis, outils utiles et ressources concretes.",
  "infirmier-liberal":
    "Cadrez un systeme d'infirmier liberal avec tournees, soins, documents, outils utiles et ressources concretes.",
  dentiste:
    "Organisez un systeme de dentiste avec patients, soins, devis, outils utiles et ressources concretes.",
  pharmacie:
    "Structurez un systeme de pharmacie avec stock, comptoir, equipe, outils utiles et ressources concretes.",
  veterinaire:
    "Cadrez un systeme de veterinaire avec dossiers animaux, soins, stock, outils utiles et ressources concretes.",
  "photographe-videaste":
    "Structurez un systeme de photographe videaste corporate avec briefs, tournages, livrables, outils utiles et ressources concretes.",
  evenementiel:
    "Cadrez un systeme d'evenementiel professionnel avec prestataires, planning, budget, outils utiles et ressources concretes.",
  "salle-de-sport":
    "Organisez un systeme de salle de sport avec abonnements, planning, fidelisation, outils utiles et ressources concretes.",
  "agence-de-voyage":
    "Structurez un systeme d'agence de voyage avec offres, voyageurs, fournisseurs, outils utiles et ressources concretes.",
  opticien:
    "Cadrez un systeme d'opticien avec montures, commandes, mutuelles, outils utiles et ressources concretes.",
  pisciniste:
    "Organisez un systeme de pisciniste avec devis, chantiers, SAV, outils utiles et ressources concretes.",
  fleuriste:
    "Structurez un systeme de fleuriste evenementiel B2B avec commandes, livraison, stock, outils utiles et ressources concretes.",
  "food-truck":
    "Cadrez un systeme de food truck avec emplacements, stock, service, outils utiles et ressources concretes.",
  "consultant-independant":
    "Organisez un systeme de consultant independant avec missions, livrables, relances, outils utiles et ressources concretes.",
  "cabinet-assurance":
    "Structurez un systeme de cabinet d'assurance avec contrats, sinistres, renouvellements, outils utiles et ressources concretes.",
  vtc:
    "Cadrez un systeme de VTC avec courses, chauffeurs, rentabilite, outils utiles et ressources concretes.",
  "coach-professionnel":
    "Organisez un systeme de coach professionnel avec clients, seances, progression, outils utiles et ressources concretes.",
  "coach-sportif":
    "Structurez un systeme de coach sportif avec programmes, seances, paiements, outils utiles et ressources concretes.",
  "entreprise-de-securite":
    "Cadrez un systeme d'entreprise de securite B2B avec sites, agents, plannings, outils utiles et ressources concretes.",
  association:
    "Organisez un systeme d'association avec membres, evenements, finances, outils utiles et ressources concretes.",
  couvreur:
    "Structurez un systeme de couvreur avec urgences, chantiers, securite, outils utiles et ressources concretes.",
  "peintre-en-batiment":
    "Cadrez un systeme de peintre en batiment avec devis, finitions, chantiers, outils utiles et ressources concretes.",
  carreleur:
    "Organisez un systeme de carreleur avec metres, materiaux, poses, outils utiles et ressources concretes.",
  climatisation:
    "Structurez un systeme de climatisation avec installations, entretiens, SAV, outils utiles et ressources concretes.",
  serrurier:
    "Cadrez un systeme de serrurier avec urgences, interventions, pieces, outils utiles et ressources concretes.",
  osteopathe:
    "Organisez un systeme d'osteopathe avec rendez-vous, suivis, paiements, outils utiles et ressources concretes.",
  psychologue:
    "Structurez un systeme de psychologue avec rendez-vous, suivis, cadre administratif, outils utiles et ressources concretes.",
  "chasseur-immobilier":
    "Cadrez un systeme de chasseur immobilier avec mandats, visites, negociations, outils utiles et ressources concretes.",
  "agence-seo":
    "Organisez un systeme d'agence SEO avec audit, contenus, reporting, outils utiles et ressources concretes.",
  "agence-acquisition-paid-ads":
    "Structurez un systeme d'agence acquisition paid ads avec campagnes, tracking, leads, outils utiles et ressources concretes.",
  boulangerie:
    "Organisez un systeme de boulangerie avec production, vente, equipe, outils utiles et ressources concretes.",
  "commerce-de-detail":
    "Structurez un systeme de commerce de detail avec stock, ventes, caisse, outils utiles et ressources concretes.",
  "e-commerce":
    "Cadrez un systeme d'e-commerce avec commandes, stock, SAV, outils utiles et ressources concretes.",
  "boutique-specialisee":
    "Organisez un systeme de boutique specialisee avec assortiment, stock, conseil client, outils utiles et ressources concretes.",
  "tabac-presse-point-relais":
    "Structurez un systeme de tabac presse point relais avec caisse, stocks, services, outils utiles et ressources concretes.",
  librairie:
    "Cadrez un systeme de librairie avec catalogue, commandes, stock, outils utiles et ressources concretes.",
  "institut-de-beaute":
    "Organisez un systeme d'institut de beaute avec agenda, prestations, clientes, outils utiles et ressources concretes.",
  "salon-de-coiffure":
    "Structurez un systeme de salon de coiffure avec agenda, equipe, ventes, outils utiles et ressources concretes.",
  esthetique:
    "Cadrez un systeme d'esthetique avec rendez-vous, prestations, relances, outils utiles et ressources concretes.",
  "services-a-la-personne":
    "Organisez un systeme de services a la personne avec demandes, plannings, intervenants, outils utiles et ressources concretes.",
  "aide-a-domicile-menage":
    "Structurez un systeme d'aide a domicile et menage avec beneficiaires, plannings, remplacements, outils utiles et ressources concretes.",
  pressing:
    "Cadrez un systeme de pressing avec depots, traitements, delais, outils utiles et ressources concretes.",
  "laverie-automatique":
    "Organisez un systeme de laverie automatique avec machines, paiements, maintenance, outils utiles et ressources concretes.",
  "organisme-de-formation":
    "Structurez un systeme d'organisme de formation avec inscriptions, sessions, Qualiopi, outils utiles et ressources concretes.",
  cfa:
    "Cadrez un systeme de CFA avec apprentis, contrats, entreprises, outils utiles et ressources concretes.",
  "formation-en-ligne":
    "Organisez un systeme de formation en ligne avec apprenants, contenus, ventes, outils utiles et ressources concretes.",
  creche:
    "Structurez un systeme de creche avec familles, transmissions, equipe, outils utiles et ressources concretes.",
  "daf-externalise":
    "Structurez un systeme de DAF externalise avec budget, tresorerie, reporting, outils utiles, partenaires et ressources concretes.",
  "office-manager-externalise":
    "Organisez un systeme d'office manager externalise avec administration, achats, fournisseurs, outils utiles et ressources concretes.",
  "assistant-administratif-externalise":
    "Structurez un systeme d'assistant administratif externalise avec documents, relances, factures, outils utiles et ressources concretes.",
  "secretariat-externalise":
    "Mettez en place un systeme de secretariat externalise avec appels, agenda, transmissions, outils utiles et ressources concretes.",
  "gestionnaire-paie-independant":
    "Structurez un systeme de gestionnaire de paie independant avec variables, bulletins, DSN, outils utiles et ressources concretes.",
  "cabinet-rh-externalise":
    "Organisez un systeme de cabinet RH externalise avec recrutements, administration RH, outils utiles et ressources concretes.",
  "centre-appels-support-client":
    "Pilotez un systeme de centre d'appels et support client avec tickets, SLA, outils utiles et ressources concretes.",
  "societe-recouvrement":
    "Cadrez un systeme de societe de recouvrement avec creances, relances, preuves, outils utiles et ressources concretes.",
  "centre-affaires-coworking":
    "Organisez un systeme de centre d'affaires et coworking avec espaces, membres, contrats, outils utiles et ressources concretes.",
  "cabinet-qhse-conformite":
    "Structurez un systeme QHSE et conformite avec audits, plans d'action, preuves, outils utiles et ressources concretes.",
  "bureau-etudes":
    "Cadrez un systeme de bureau d'etudes avec demandes, livrables, validations, outils utiles et ressources concretes.",
  "cabinet-etudes":
    "Structurez un systeme de cabinet d'etudes avec analyses, livrables, recommandations, outils utiles et ressources concretes.",
  "agence-de-recrutement":
    "Structurez un systeme d'agence de recrutement avec candidats, clients, suivis, outils utiles et ressources concretes.",
  "courtier-credit-assurance":
    "Organisez un systeme de courtier credit et assurance avec qualification, pieces, partenaires, outils utiles et ressources concretes.",
  notaire:
    "Structurez un systeme de notaire avec actes, pieces, echeances, outils utiles et ressources concretes.",
  "gestionnaire-de-patrimoine":
    "Cadrez un systeme de gestionnaire de patrimoine avec bilan client, recommandations, conformite, outils utiles et ressources concretes.",
  "infogerance-informatique":
    "Pilotez un systeme d'infogerance informatique avec parc client, tickets, interventions, outils utiles et ressources concretes.",
  "cybersecurite-pme":
    "Structurez un systeme de cybersecurite PME avec audits, remediations, preuves, outils utiles et ressources concretes.",
  "integrateur-crm-erp":
    "Cadrez un systeme d'integrateur CRM et ERP avec parametrage, migration, support, outils utiles et ressources concretes.",
  "consultant-data-bi":
    "Structurez un systeme de consultant data et BI avec sources, tableaux de bord, indicateurs, outils utiles et ressources concretes.",
  "reparation-informatique-mobile":
    "Organisez un systeme de maintenance informatique B2B avec tickets, interventions, delais, outils utiles et ressources concretes.",
  syndic:
    "Organisez un systeme de syndic avec coproprietes, assemblees, urgences, outils utiles et ressources concretes.",
  "gestion-locative":
    "Pilotez un systeme de gestion locative avec loyers, incidents, locataires, outils utiles et ressources concretes.",
  "diagnostiqueur-immobilier":
    "Structurez un systeme de diagnostiqueur immobilier avec rendez-vous, rapports, conformite, outils utiles et ressources concretes.",
  restaurant:
    "Organisez un systeme de restaurant avec service, equipe, achats, outils utiles et ressources concretes.",
  "fast-food":
    "Structurez un systeme de fast-food avec commandes, stocks, equipe, outils utiles et ressources concretes.",
  traiteur:
    "Cadrez un systeme de traiteur B2B avec devis, production, livraison, outils utiles et ressources concretes.",
  "dark-kitchen":
    "Organisez un systeme de dark kitchen avec commandes, plateformes, production, outils utiles et ressources concretes.",
  "bar-cafe":
    "Structurez un systeme de cafe avec service, caisse, equipe, outils utiles et ressources concretes.",
  "hotel-hebergement-independant":
    "Cadrez un systeme d'hotel et hebergement independant avec reservations, menage, avis clients, outils utiles et ressources concretes.",
  "commerce-alimentaire":
    "Organisez un systeme de commerce alimentaire avec produits, fournisseurs, caisse, outils utiles et ressources concretes.",
  geometre:
    "Organisez un systeme de geometre avec releves, plans, foncier, outils utiles et ressources concretes.",
  "architecte-maitre-oeuvre":
    "Cadrez un systeme d'architecte et maitre d'oeuvre avec plans, artisans, chantier, outils utiles et ressources concretes.",
  "nettoyage-professionnel":
    "Structurez un systeme de nettoyage professionnel avec equipes, controles, reclamations, outils utiles et ressources concretes.",
  demenagement:
    "Cadrez un systeme de demenagement professionnel avec devis, planning, equipes, outils utiles et ressources concretes.",
  "auto-ecole":
    "Organisez un systeme d'auto-ecole avec inscriptions, sessions, examens, outils utiles et ressources concretes.",
  "studio-branding-design":
    "Structurez un systeme de studio branding et design avec creations, validations, livrables, outils utiles et ressources concretes.",
};

export async function getSystemDetailPageData(
  slug: string,
): Promise<SystemDetailPageData | null> {
  const enterprise = await getEnterpriseBySlug(slug);

  if (!enterprise) {
    return null;
  }

  const system = enterpriseToSystem(enterprise);
  const detail = await buildOperationalSystemDetail(system);

  return {
    enterprise,
    system,
    detail,
  };
}

function singularizeSectorLabel(label: string): string {
  return label.replace(/^les\s+/i, "").replace(/^la\s+/i, "").replace(/^le\s+/i, "").trim();
}

export function buildSystemPageTitle(data: SystemDetailPageData): string {
  return `${data.system.name} : checklist, outils et services | Demaa`;
}

export function buildSystemPageIntro(data: SystemDetailPageData): string {
  return data.enterprise.description;
}

export function buildSystemPageDescription(data: SystemDetailPageData): string {
  const override = SYSTEM_PAGE_DESCRIPTION_OVERRIDES[data.system.slug];

  if (override) {
    return override;
  }

  const sectorLabel = singularizeSectorLabel(data.detail.sectorLabel).toLowerCase();
  const parts = [
    data.enterprise.description,
    `${data.detail.processes.length} points de checklist, ${data.detail.tools.length} outils ${data.detail.tools.length > 1 ? "recommandes" : "recommande"} pour structurer une activite de ${sectorLabel}.`,
  ];

  return parts.join(" ");
}

export function buildSystemPageMetadata(data: SystemDetailPageData): Metadata {
  const title = buildSystemPageTitle(data);
  const description = buildSystemPageDescription(data);
  const url = `/systemes/${data.system.slug}`;

  return {
    title,
    description,
    keywords: [
      data.system.name,
      `checklist ${data.system.name.toLowerCase()}`,
      `outils ${data.system.name.toLowerCase()}`,
      `organisation ${data.system.name.toLowerCase()}`,
      `structurer ${data.system.name.toLowerCase()}`,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildSystemPageJsonLd(data: SystemDetailPageData) {
  const url = `https://demaa.fr/systemes/${data.system.slug}`;
  const description = buildSystemPageDescription(data);
  const listedProcesses = data.detail.processes.slice(0, 8);
  const listedTools = data.detail.tools.slice(0, 8);

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: data.system.name,
      description,
      url,
      about: {
        "@type": "Thing",
        name: data.system.name,
        description: data.system.description,
      },
      isPartOf: {
        "@type": "WebSite",
        name: "Demaa",
        url: "https://demaa.fr",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Ressources du système ${data.system.name}`,
      numberOfItems: listedProcesses.length + listedTools.length,
      itemListElement: [
        ...listedProcesses.map((process, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: process.title,
        })),
        ...listedTools.map((tool, index) => ({
          "@type": "ListItem",
          position: listedProcesses.length + index + 1,
          name: tool.name,
          url: tool.slug ? `https://demaa.fr/annuaire-outils/${tool.slug}` : undefined,
        })),
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: "https://demaa.fr",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Systèmes",
          item: "https://demaa.fr",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: data.system.name,
          item: url,
        },
      ],
    },
  ];
}
