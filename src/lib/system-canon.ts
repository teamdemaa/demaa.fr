import { getSystemProcessOrder } from "@/lib/system-process-order";

const SYSTEME_BASE_PILLARS = [
  "Direction",
  "Marketing et Vente",
  "Opérations",
  "Équipe",
  "Finance et Admin",
] as const;

export type SystemeBasePillar = (typeof SYSTEME_BASE_PILLARS)[number];

export type SystemePillar =
  | SystemeBasePillar
  | "Conformité & obligations"
  | "Sécurité & Conformité Chantier"
  | "Matériel & Approvisionnement"
  | "Hygiène & Conformité"
  | "Conformité Qualiopi"
  | "Qualité & conformité formation"
  | "Conformité métier"
  | "Protection des apprentis mineurs"
  | string;

export type SystemeRow = {
  sectorSlug: string;
  sectorName: string;
  pillar: SystemePillar;
  process: string;
  document: string;
};

const LEGACY_PILLAR_MAP = {
  "Stratégie": "Direction",
  Strategie: "Direction",
  "Marketing & Vente": "Marketing et Vente",
  "Finance & administration": "Finance et Admin",
  "Finance & Juridique": "Finance et Admin",
  "Opérations": "Opérations",
  Operations: "Opérations",
  "Équipe": "Équipe",
  Equipe: "Équipe",
} as const;

export function normalizeSystemePillar(pillar: string): SystemePillar {
  return LEGACY_PILLAR_MAP[pillar as keyof typeof LEGACY_PILLAR_MAP] ?? pillar;
}

const PILLAR_ORDER_INDEX = new Map<string, number>(
  SYSTEME_BASE_PILLARS.map((pillar, index) => [pillar, index]),
);

function sortSystemeRows(rows: SystemeRow[]): SystemeRow[] {
  return [...rows].sort((left, right) => {
    const leftOrder = PILLAR_ORDER_INDEX.get(left.pillar) ?? Number.POSITIVE_INFINITY;
    const rightOrder = PILLAR_ORDER_INDEX.get(right.pillar) ?? Number.POSITIVE_INFINITY;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    if (left.pillar !== right.pillar) {
      return left.pillar.localeCompare(right.pillar, "fr");
    }

    const leftProcessOrder = getSystemProcessOrder(left.pillar, left.process, left.document);
    const rightProcessOrder = getSystemProcessOrder(right.pillar, right.process, right.document);

    if (leftProcessOrder.order !== rightProcessOrder.order) {
      return leftProcessOrder.order - rightProcessOrder.order;
    }

    return left.process.localeCompare(right.process, "fr");
  });
}

export function groupSystemeRowsByPillar(rows: SystemeRow[]) {
  const grouped = new Map<SystemePillar, SystemeRow[]>();

  for (const row of sortSystemeRows(rows)) {
    const list = grouped.get(row.pillar);

    if (list) {
      list.push(row);
    } else {
      grouped.set(row.pillar, [row]);
    }
  }

  return grouped;
}
