import "server-only";

import { enterpriseCatalogBySlug } from "@/lib/enterprise-annuaire";
import {
  formatLiveSessionDate,
  getLiveSessionPurchaseDetails,
} from "@/lib/live-session-catalog";

type LiveSessionDeliveredAsset = {
  id: string;
  label: string;
  description: string;
  href: string;
  external?: boolean;
};

export type LiveSessionAccess = {
  purchaseSlug: string;
  trainingTitle: string;
  sessionDate: string;
  systemName: string | null;
  assets: LiveSessionDeliveredAsset[];
};

function getAssets(trainingSlug: string, sourceSystemSlug: string | null) {
  const system = sourceSystemSlug
    ? enterpriseCatalogBySlug[sourceSystemSlug] ?? null
    : null;

  switch (trainingSlug) {
    case "obligations-finances-entreprise":
      return [
        {
          id: "suivi-previsionnel-financier",
          label: "P&L, suivi et prévisionnel financier",
          description: "Le modèle pour suivre le résultat, la trésorerie, le budget et les mois à venir.",
          href: "/modeles-de-documents/suivi-previsionnel-financier",
        },
        ...(system
          ? [
              {
                id: "tableau-pilotage-metier",
                label: `Kit opérationnel ${system.name}`,
                description: "Les process, tâches, responsables et récurrences adaptés à votre activité.",
                href: `/kit-operationnel/${system.slug}`,
              },
            ]
          : []),
      ];
    case "repondre-appels-offres-btp":
      return [
        {
          id: "checklist-appel-offres",
          label: "Checklist du dossier d’appel d’offres",
          description: "Les pièces et contrôles essentiels avant le dépôt.",
          href: "/formation-assets/appels-offres/checklist-dossier.csv",
        },
        {
          id: "trame-memoire-technique",
          label: "Trame de mémoire technique",
          description: "Une structure simple à personnaliser selon les critères de notation.",
          href: "/formation-assets/appels-offres/trame-memoire-technique.csv",
        },
        {
          id: "suivi-appels-offres",
          label: "Tableau de suivi des appels d’offres",
          description: "Le suivi des échéances, décisions et prochaines actions.",
          href: "/formation-assets/appels-offres/suivi-appels-offres.csv",
        },
        {
          id: "accompagnement-premiere-reponse",
          label: "Accompagnement à votre première réponse",
          description: "Demaa relit et vous aide à finaliser votre premier dossier après la formation.",
          href: "mailto:team@demaa.fr?subject=Accompagnement%20première%20réponse%20à%20un%20appel%20d’offres",
          external: true,
        },
      ];
    case "entreprise-autonome":
      return system
        ? [
            {
              id: "kit-process-systeme",
              label: `Kit opérationnel ${system.name}`,
              description: "Les process, tâches, responsables et récurrences adaptés à votre métier.",
              href: `/kit-operationnel/${system.slug}`,
            },
          ]
        : [];
    case "facturation-electronique-impacts":
      return [
        {
          id: "checklist-facturation-electronique",
          label: "Checklist de préparation à la facturation électronique",
          description: "Les actions à attribuer et à suivre avant votre échéance.",
          href: "/formation-assets/facturation-electronique/checklist-preparation.csv",
        },
        {
          id: "support-facturation-electronique",
          label: "Support sur la facturation électronique",
          description: "Le calendrier, les obligations et les impacts à retenir.",
          href: "/cours/facture-electronique",
        },
      ];
    case "systeme-marketing-vente":
      return [
        {
          id: "systeme-marketing-vente-airtable",
          label: "Système Marketing & Vente sur Airtable",
          description: "La base pour structurer le pipeline, les relances et le suivi des conversions.",
          href: "/modeles-de-documents/systeme-operationnel",
        },
      ];
    default:
      return [];
  }
}

export function getLiveSessionAccessForPurchaseSlug(
  purchaseSlug: string,
): LiveSessionAccess | null {
  const details = getLiveSessionPurchaseDetails(purchaseSlug);

  if (!details) {
    return null;
  }

  const system = details.sourceSystemSlug
    ? enterpriseCatalogBySlug[details.sourceSystemSlug] ?? null
    : null;

  return {
    purchaseSlug,
    trainingTitle: details.training.title,
    sessionDate: formatLiveSessionDate(details.slot.startsAt),
    systemName: system?.name ?? null,
    assets: getAssets(details.training.slug, details.sourceSystemSlug),
  };
}
