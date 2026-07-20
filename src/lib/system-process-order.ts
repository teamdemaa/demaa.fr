import type { SystemeBasePillar } from "@/lib/system-canon";

export type SystemProcessCategory =
  | "direction_vision"
  | "direction_decision"
  | "direction_access"
  | "direction_pilotage"
  | "marketing_acquisition"
  | "marketing_vente"
  | "marketing_fidelisation"
  | "marketing_reclamation"
  | "operations_ouverture"
  | "operations_execution"
  | "operations_controle"
  | "operations_aleas"
  | "operations_cloture"
  | "equipe_organisation"
  | "equipe_continuite"
  | "equipe_integration"
  | "equipe_transmission"
  | "finance_pilotage"
  | "finance_encaissement"
  | "finance_paiement"
  | "finance_conformite";

type CategoryRule = {
  category: SystemProcessCategory;
  patterns: RegExp[];
};

const PROCESS_CATEGORY_RULES: Record<SystemeBasePillar, CategoryRule[]> = {
  Direction: [
    {
      category: "direction_vision",
      patterns: [/savoir o[uù] va/i, /vision/i, /objectifs?/i, /positionnement/i],
    },
    {
      category: "direction_decision",
      patterns: [/d[eé]cid/i, /grille d[' ]autorit[eé]/i, /arbitrage/i],
    },
    {
      category: "direction_access",
      patterns: [/donner acc[eè]s/i, /acc[eè]s/i, /informations? critiques/i],
    },
    {
      category: "direction_pilotage",
      patterns: [/visibilit[eé]/i, /pilotage/i, /tableau de bord/i],
    },
  ],
  "Marketing et Vente": [
    {
      category: "marketing_acquisition",
      patterns: [/d[eé]velopper/i, /attirer/i, /prospection/i, /portefeuille/i, /inscriptions?/i, /recruter/i],
    },
    {
      category: "marketing_vente",
      patterns: [/vendre/i, /devis/i, /offre/i, /argumentaire/i, /proposition commerciale/i, /qualifier/i],
    },
    {
      category: "marketing_fidelisation",
      patterns: [/faire revenir/i, /fid[eé]lis/i, /avis/i, /rendez-vous/i, /suivi post/i],
    },
    {
      category: "marketing_reclamation",
      patterns: [/r[eé]clamation/i, /litige/i, /retour client/i, /signalement/i, /incident client/i],
    },
  ],
  Opérations: [
    {
      category: "operations_ouverture",
      patterns: [/ouvrir/i, /ouverture/i, /d[eé]marr/i, /lancer/i, /entrer un bien/i, /constituer un dossier/i],
    },
    {
      category: "operations_execution",
      patterns: [/pr[eé]parer/i, /produire/i, /ex[eé]cut/i, /r[eé]aliser/i, /planifier/i, /g[eé]rer/i, /tenir/i],
    },
    {
      category: "operations_controle",
      patterns: [/contr[oô]l/i, /suivre/i, /v[eé]rifier/i, /mesurer/i, /piloter/i, /tracer/i],
    },
    {
      category: "operations_aleas",
      patterns: [/al[eé]a/i, /incident/i, /impr[eé]vu/i, /retard/i, /panne/i, /sinistre/i],
    },
    {
      category: "operations_cloture",
      patterns: [/cl[oô]tur/i, /r[eé]ception/i, /restitut/i, /livrer/i, /signature/i, /sortie/i],
    },
  ],
  "Équipe": [
    {
      category: "equipe_organisation",
      patterns: [/organiser/i, /r[oô]les?/i, /charge/i, /planning/i, /astreintes?/i],
    },
    {
      category: "equipe_continuite",
      patterns: [/remplacer/i, /continuit[eé]/i, /absence/i, /astreinte/i],
    },
    {
      category: "equipe_integration",
      patterns: [/int[eé]grer/i, /nouvel/i, /arrivant/i],
    },
    {
      category: "equipe_transmission",
      patterns: [/transmettre/i, /passation/i, /autonomie/i, /mont[eé]e en autonomie/i],
    },
  ],
  "Finance et Admin": [
    {
      category: "finance_pilotage",
      patterns: [/suivre/i, /rentabilit[eé]/i, /marge/i, /tr[eé]sorerie/i, /cash-flow/i, /performance/i],
    },
    {
      category: "finance_encaissement",
      patterns: [/se faire payer/i, /encaisse/i, /facturation/i, /r[eè]glements?/i, /reversements?/i],
    },
    {
      category: "finance_paiement",
      patterns: [/payer [aà] temps/i, /payer/i, /[eé]ch[eé]ances/i],
    },
    {
      category: "finance_conformite",
      patterns: [/conformit[eé]/i, /justificatifs?/i, /obligations?/i],
    },
  ],
};

const CATEGORY_ORDER_INDEX = new Map<SystemProcessCategory, number>([
  ["direction_vision", 0],
  ["direction_decision", 1],
  ["direction_access", 2],
  ["direction_pilotage", 3],
  ["marketing_acquisition", 0],
  ["marketing_vente", 1],
  ["marketing_fidelisation", 2],
  ["marketing_reclamation", 3],
  ["operations_ouverture", 0],
  ["operations_execution", 1],
  ["operations_controle", 2],
  ["operations_aleas", 3],
  ["operations_cloture", 4],
  ["equipe_organisation", 0],
  ["equipe_continuite", 1],
  ["equipe_integration", 2],
  ["equipe_transmission", 3],
  ["finance_pilotage", 0],
  ["finance_encaissement", 1],
  ["finance_paiement", 2],
  ["finance_conformite", 3],
]);

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();
}

function getSystemProcessCategory(
  pillar: string,
  process: string,
  document: string,
): SystemProcessCategory | null {
  const rules = PROCESS_CATEGORY_RULES[pillar as SystemeBasePillar];

  if (!rules) {
    return null;
  }

  const haystack = normalizeText(`${process} || ${document}`);

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return rule.category;
    }
  }

  return null;
}

export function getSystemProcessOrder(
  pillar: string,
  process: string,
  document: string,
) {
  const category = getSystemProcessCategory(pillar, process, document);

  return {
    category,
    order: category ? (CATEGORY_ORDER_INDEX.get(category) ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY,
  };
}
