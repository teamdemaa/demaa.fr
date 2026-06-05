export type AssistantPackId =
  | "automation-5h"
  | "automation-10h"
  | "automation-20h"
  | "facturation-10h"
  | "facturation-20h"
  | "facturation-30h"
  | "administratif-10h"
  | "administratif-20h"
  | "administratif-30h"
  | "subvention-1"
  | "subvention-2"
  | "subvention-3"
  | "appel-offre-1"
  | "appel-offre-2"
  | "appel-offre-3";

export type AssistantOfferId =
  | "structuration-automatisation"
  | "facturation"
  | "administratif"
  | "subvention"
  | "appel-offre";

export type AssistantPack = {
  id: AssistantPackId;
  label: string;
  amount: number;
  detail: string;
};

export type AssistantOffer = {
  id: AssistantOfferId;
  title: string;
  category: string;
  description: string;
  rateLabel: string;
  startingLabel: string;
  packs: readonly AssistantPack[];
};

export const ASSISTANT_PACK_OFFERS = [
  {
    id: "structuration-automatisation",
    title: "Structuration & automatisation",
    category: "Organisation",
    description:
      "Clarifier vos process, identifier les tâches répétitives et mettre en place des automatisations simples.",
    rateLabel: "60 € / heure",
    startingLabel: "À partir de 300 €",
    packs: [
      { id: "automation-5h", label: "5 heures", amount: 300, detail: "Pack de démarrage" },
      { id: "automation-10h", label: "10 heures", amount: 570, detail: "Pack renforcé" },
      { id: "automation-20h", label: "20 heures", amount: 1080, detail: "Pack complet" },
    ],
  },
  {
    id: "facturation",
    title: "Facturation",
    category: "Finance",
    description:
      "Classer les factures, suivre les paiements, préparer les éléments comptables et relancer simplement.",
    rateLabel: "30 € / heure",
    startingLabel: "À partir de 300 €",
    packs: [
      { id: "facturation-10h", label: "10 heures", amount: 300, detail: "Pack facturation" },
      { id: "facturation-20h", label: "20 heures", amount: 570, detail: "Pack suivi" },
      { id: "facturation-30h", label: "30 heures", amount: 810, detail: "Pack mensuel" },
    ],
  },
  {
    id: "administratif",
    title: "Administratif",
    category: "Administration",
    description:
      "Classer les documents, préparer des formulaires, suivre les dossiers et organiser les pièces utiles.",
    rateLabel: "25 € / heure",
    startingLabel: "À partir de 250 €",
    packs: [
      { id: "administratif-10h", label: "10 heures", amount: 250, detail: "Pack administratif" },
      { id: "administratif-20h", label: "20 heures", amount: 475, detail: "Pack suivi" },
      { id: "administratif-30h", label: "30 heures", amount: 675, detail: "Pack mensuel" },
    ],
  },
  {
    id: "subvention",
    title: "Subvention",
    category: "Financement",
    description:
      "Préparer un dossier de subvention simple avec les pièces, les informations demandées et le suivi de dépôt.",
    rateLabel: "Minimum par dossier",
    startingLabel: "À partir de 500 €",
    packs: [
      { id: "subvention-1", label: "1 dossier", amount: 500, detail: "Pack dossier" },
      { id: "subvention-2", label: "2 dossiers", amount: 950, detail: "Pack dossiers" },
      { id: "subvention-3", label: "3 dossiers", amount: 1350, detail: "Pack dossiers" },
    ],
  },
  {
    id: "appel-offre",
    title: "Appel d'offre",
    category: "Dossiers",
    description:
      "Préparer une réponse simple à appel d'offre avec les pièces, la trame de réponse et les éléments demandés.",
    rateLabel: "Minimum par réponse",
    startingLabel: "À partir de 500 €",
    packs: [
      { id: "appel-offre-1", label: "1 réponse", amount: 500, detail: "Pack réponse" },
      { id: "appel-offre-2", label: "2 réponses", amount: 950, detail: "Pack réponses" },
      { id: "appel-offre-3", label: "3 réponses", amount: 1350, detail: "Pack réponses" },
    ],
  },
] as const satisfies readonly AssistantOffer[];

export function formatAssistantPrice(amount: number) {
  return `${amount.toLocaleString("fr-FR")} €`;
}

export function getAssistantPack(packId: string) {
  for (const offer of ASSISTANT_PACK_OFFERS) {
    const pack = offer.packs.find((item) => item.id === packId);

    if (pack) {
      return { offer, pack };
    }
  }

  return null;
}
