export type AssistantPackId =
  | "audit-process"
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
      "Structurer vos process, mettre en place des systèmes de travail clairs, automatiser les tâches répétitives et vous accompagner dans la prise en main.",
    rateLabel: "Accompagnement mensuel",
    startingLabel: "Audit gratuit puis accompagnement à partir de 750 €",
    packs: [
      { id: "audit-process", label: "Audit organisation", amount: 0, detail: "Appel gratuit pour comprendre votre organisation, vos blocages et les premières améliorations possibles" },
      { id: "automation-5h", label: "1 mois", amount: 750, detail: "Structuration, mise en place d’un premier système et accompagnement à la prise en main" },
      { id: "automation-10h", label: "2 mois", amount: 1400, detail: "Structuration de plusieurs process, mise en place des systèmes prioritaires et accompagnement dans la durée" },
      { id: "automation-20h", label: "3 mois", amount: 1950, detail: "Système opérationnel plus complet, automatisations, documentation et accompagnement jusqu’à l’adoption" },
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
    id: "appel-offre",
    title: "Appel d'offre",
    category: "Dossiers",
    description:
      "Structurer votre réponse, rassembler les pièces demandées, clarifier les éléments attendus et préparer un dossier prêt à envoyer.",
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
