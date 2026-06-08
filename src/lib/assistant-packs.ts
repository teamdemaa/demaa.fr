export type AssistantPackId =
  | "audit-process"
  | "structuration-1-societe"
  | "structuration-2-societes"
  | "structuration-3-societes"
  | "facturation-10h"
  | "facturation-20h"
  | "facturation-30h"
  | "administratif-20h"
  | "administratif-30h"
  | "administratif-40h"
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
    title: "Structuration & Automatisation",
    category: "Organisation",
    description:
      "On structure avec vous les process, les outils et les automatisations pour que l’entreprise gagne en clarté, en temps et en capacité de développement.",
    rateLabel: "Forfait structuration",
    startingLabel: "À partir de 1500 €",
    packs: [
      { id: "audit-process", label: "Audit organisation", amount: 0, detail: "Appel gratuit pour comprendre votre organisation, vos blocages et les premières améliorations possibles" },
      { id: "structuration-1-societe", label: "1 société", amount: 1500, detail: "Système clair, process posés et automatisations utiles pour gagner du temps" },
      { id: "structuration-2-societes", label: "2 sociétés", amount: 2900, detail: "Structuration coordonnée pour deux sociétés" },
      { id: "structuration-3-societes", label: "3 sociétés", amount: 4300, detail: "Structuration coordonnée pour trois sociétés" },
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
    title: "Assistant polyvalent",
    category: "Administration",
    description:
      "On garde votre administratif à jour : factures, relances clients, suivi des dossiers, documents et organisation des tâches récurrentes.",
    rateLabel: "25 € / heure",
    startingLabel: "Minimum 20 h / mois",
    packs: [
      { id: "administratif-20h", label: "20 h / mois", amount: 500, detail: "Minimum mensuel pour déléguer les tâches récurrentes" },
      { id: "administratif-30h", label: "30 h / mois", amount: 750, detail: "Pack mensuel pour un suivi plus régulier" },
      { id: "administratif-40h", label: "40 h / mois", amount: 1000, detail: "Pack mensuel pour une délégation plus complète" },
    ],
  },
  {
    id: "appel-offre",
    title: "Appel d'offre",
    category: "Dossiers",
    description:
      "On vous aide à structurer une réponse claire, complète et bien positionnée pour mettre toutes les chances de votre côté.",
    rateLabel: "Minimum par réponse",
    startingLabel: "À partir de 500 €",
    packs: [
      { id: "appel-offre-1", label: "1 réponse", amount: 500, detail: "Pack réponse" },
      { id: "appel-offre-2", label: "2 réponses", amount: 950, detail: "Pack réponses" },
      { id: "appel-offre-3", label: "3 réponses", amount: 1350, detail: "Pack réponses" },
    ],
  },
  {
    id: "subvention",
    title: "Subvention",
    category: "Financement",
    description:
      "Vérifier l’éligibilité, réunir les justificatifs, compléter les informations demandées et préparer un dossier de subvention propre.",
    rateLabel: "Minimum par dossier",
    startingLabel: "À partir de 500 €",
    packs: [
      { id: "subvention-1", label: "1 dossier", amount: 500, detail: "Pack dossier" },
      { id: "subvention-2", label: "2 dossiers", amount: 950, detail: "Pack dossiers" },
      { id: "subvention-3", label: "3 dossiers", amount: 1350, detail: "Pack dossiers" },
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
