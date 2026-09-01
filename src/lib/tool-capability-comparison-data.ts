import type {
  ToolCapabilityComparisonReview,
  ToolFeatureComparisonReview,
  ToolProcessComparisonStatus,
} from "@/lib/tool-process-comparison-contract";
import { isKnownToolComparisonCapabilityId } from "@/lib/tool-feature-comparison-catalog";

type EvidenceInput = Readonly<{
  suffix: string;
  sourceRef: string;
  claim: string;
}>;

type CapabilityInput = Readonly<{
  status: Exclude<ToolProcessComparisonStatus, "not_documented">;
  evidenceSuffixes: readonly string[];
  note?: string;
}>;

const REVIEWED_AT = "2026-09-01";
const EXPIRES_AT = "2027-02-28";

const covered = (...evidenceSuffixes: string[]): CapabilityInput => ({
  status: "covered",
  evidenceSuffixes,
});

function buildCapabilityReview(input: {
  resourceSlug: string;
  positioning: string;
  evidence: readonly EvidenceInput[];
  capabilities: Readonly<Record<string, CapabilityInput>>;
  configurableNote?: string;
}): ToolCapabilityComparisonReview {
  const evidenceIdBySuffix = new Map<string, string>();
  for (const item of input.evidence) {
    if (evidenceIdBySuffix.has(item.suffix)) {
      throw new Error(
        `Suffixe de preuve dupliqué ${input.resourceSlug}/${item.suffix}`,
      );
    }
    evidenceIdBySuffix.set(item.suffix, `${input.resourceSlug}-${item.suffix}`);
  }

  const evidence = input.evidence.map((item) => ({
    evidenceId: evidenceIdBySuffix.get(item.suffix)!,
    sourceRef: item.sourceRef,
    claim: item.claim,
    capturedAt: REVIEWED_AT,
  }));

  const capabilities = Object.fromEntries(
    Object.entries(input.capabilities).map(([capabilityId, review]) => {
      if (!isKnownToolComparisonCapabilityId(capabilityId)) {
        throw new Error(
          `Fonctionnalité atomique inconnue ${input.resourceSlug}/${capabilityId}`,
        );
      }
      if (review.evidenceSuffixes.length === 0) {
        throw new Error(`Preuve absente ${input.resourceSlug}/${capabilityId}`);
      }
      return [
        capabilityId,
        {
          status: review.status,
          evidenceIds: review.evidenceSuffixes.map((suffix) => {
            const evidenceId = evidenceIdBySuffix.get(suffix);
            if (!evidenceId) {
              throw new Error(
                `Preuve inconnue ${input.resourceSlug}/${capabilityId}/${suffix}`,
              );
            }
            return evidenceId;
          }),
          note: review.note,
        } satisfies ToolFeatureComparisonReview,
      ];
    }),
  );

  return {
    resourceSlug: input.resourceSlug,
    positioning: input.positioning,
    reviewedAt: REVIEWED_AT,
    expiresAt: EXPIRES_AT,
    configurableNote:
      input.configurableNote ??
      "Couverture partielle, selon l’offre ou via un module connecté.",
    evidence,
    capabilities,
  };
}

/**
 * Banque de faits atomiques, indépendante des pages métier. Une absence dans
 * `capabilities` signifie uniquement « non documenté dans les sources
 * vérifiées » : le moteur n'en déduit jamais que la fonction est impossible.
 */
export const TOOL_CAPABILITY_COMPARISON_REVIEWS: readonly ToolCapabilityComparisonReview[] = [
  buildCapabilityReview({
    resourceSlug: "obat",
    positioning: "Devis & suivi de chantier",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://www.obat.fr/",
        claim: "Devis, factures et suivi commercial pour les entreprises du BTP.",
      },
      {
        suffix: "site-tracking",
        sourceRef: "https://www.obat.fr/suivi-chantier/",
        claim: "Planning, achats, temps, avancement et rentabilité du chantier.",
      },
    ],
    capabilities: {
      crm: covered("official"),
      quotes: covered("official"),
      invoicing: covered("official"),
      calendar: covered("site-tracking"),
      site_tracking: covered("site-tracking"),
      time_tracking: covered("site-tracking"),
      purchasing: covered("site-tracking"),
      profitability: covered("site-tracking"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "costructor",
    positioning: "Gestion BTP",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://costructor.co/",
        claim: "Devis, signature, planning et suivi de chantier, achats et rentabilité.",
      },
      {
        suffix: "invoicing",
        sourceRef: "https://costructor.co/logiciel-facturation/",
        claim: "Facturation BTP, relances, facture électronique et synchronisation comptable.",
      },
    ],
    capabilities: {
      quotes: covered("official"),
      esignature: covered("official"),
      calendar: covered("official"),
      site_tracking: covered("official"),
      purchasing: covered("official"),
      profitability: covered("official"),
      invoicing: covered("invoicing"),
      payment_reminders: covered("invoicing"),
      electronic_invoicing: covered("invoicing"),
      accounting_export: covered("invoicing"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "progbat",
    positioning: "Gestion BTP tout-en-un",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://www.progbat.com/",
        claim: "Devis, factures, planning, heures, gestion de chantier, rentabilité, achats, pré-comptabilité et mobilité pour les entreprises du bâtiment.",
      },
    ],
    capabilities: {
      quotes: covered("official"),
      invoicing: covered("official"),
      calendar: covered("official"),
      team_planning: covered("official"),
      site_tracking: covered("official"),
      purchasing: covered("official"),
      time_tracking: covered("official"),
      profitability: covered("official"),
      mobile: covered("official"),
      accounting_export: covered("official"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "vertuoza",
    positioning: "Pilotage de chantier",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://www.vertuoza.com/fr-fr/saas/batiment",
        claim: "CRM, devis, facturation, planning, chantier, achats, temps, stocks et application mobile.",
      },
    ],
    capabilities: {
      crm: covered("official"),
      quotes: covered("official"),
      invoicing: covered("official"),
      calendar: covered("official"),
      team_planning: covered("official"),
      site_documents: covered("official"),
      site_tracking: covered("official"),
      purchasing: covered("official"),
      inventory: covered("official"),
      time_tracking: covered("official"),
      profitability: covered("official"),
      mobile: covered("official"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "lightspeed",
    positioning: "Caisse & opérations",
    evidence: [
      {
        suffix: "restaurant",
        sourceRef: "https://www.lightspeedhq.fr/caisse/restaurant/fonctionnalites/",
        claim: "Caisse, menus, commandes, paiements, cuisine, stocks, recettes, réservations, fidélité et rapports.",
      },
    ],
    capabilities: {
      pos: covered("restaurant"),
      menu: covered("restaurant"),
      reservations: covered("restaurant"),
      orders: covered("restaurant"),
      kitchen: covered("restaurant"),
      inventory: covered("restaurant"),
      food_cost: covered("restaurant"),
      loyalty: covered("restaurant"),
      payments: covered("restaurant"),
      reporting: covered("restaurant"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "zenchef",
    positioning: "Réservation & relation client",
    evidence: [
      {
        suffix: "restaurant",
        sourceRef: "https://www.zenchef.com/fr/guides/gerer-restaurant",
        claim: "Réservations, Click & Collect, menus, paiements, tables et données de performance.",
      },
      {
        suffix: "crm",
        sourceRef: "https://www.zenchef.com/fr/solution/fichier-clients-restaurant",
        claim: "CRM restaurant, segmentation, fidélisation et communications ciblées.",
      },
    ],
    capabilities: {
      menu: covered("restaurant"),
      reservations: covered("restaurant"),
      orders: covered("restaurant"),
      payments: covered("restaurant"),
      crm: covered("crm"),
      loyalty: covered("crm"),
      targeted_campaigns: covered("crm"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "laddition",
    positioning: "Caisse restaurant",
    evidence: [
      {
        suffix: "suite",
        sourceRef: "https://www.laddition.com/fr/laddition-suite",
        claim: "Suite de caisse restaurant avec réservation, menu, paiement et stocks.",
      },
      {
        suffix: "orders",
        sourceRef: "https://www.laddition.com/fr/logiciel-caisse-prise-de-commande",
        claim: "Prise de commande et transmission en cuisine depuis le logiciel de caisse.",
      },
      {
        suffix: "reporting",
        sourceRef: "https://www.laddition.com/fr/laddition-reporting",
        claim: "Tableaux de bord et suivi des performances du restaurant.",
      },
    ],
    capabilities: {
      pos: covered("suite"),
      menu: covered("suite"),
      reservations: covered("suite"),
      inventory: covered("suite"),
      payments: covered("suite"),
      orders: covered("orders"),
      kitchen: covered("orders"),
      reporting: covered("reporting"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "revya",
    positioning: "Fidélité client",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://app.revya.app/",
        claim: "Profils clients, carte de fidélité, suivi des récompenses et campagnes ciblées.",
      },
    ],
    capabilities: {
      crm: covered("official"),
      loyalty: covered("official"),
      targeted_campaigns: covered("official"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "deliverect",
    positioning: "Commandes multicanales",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://www.deliverect.com/fr",
        claim: "Centralisation des commandes, menus multicanaux, livraison et rapports de ventes.",
      },
      {
        suffix: "faq",
        sourceRef: "https://www.deliverect.com/fr-fr/questions-frequemment-posees",
        claim: "Deliverect se connecte aux caisses mais n’est pas lui-même un logiciel de caisse.",
      },
    ],
    capabilities: {
      menu: covered("official"),
      orders: covered("official"),
      delivery: covered("official"),
      marketplace_channels: covered("official"),
      reporting: covered("official"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "uber-eats",
    positioning: "Commande & livraison",
    evidence: [
      {
        suffix: "restaurants",
        sourceRef: "https://merchants.ubereats.com/fr/fr/business/restaurants/",
        claim: "Menu en ligne, commandes, livraison ou retrait, diffusion Marketplace et analyses.",
      },
    ],
    capabilities: {
      menu: covered("restaurants"),
      orders: covered("restaurants"),
      delivery: covered("restaurants"),
      marketplace_channels: covered("restaurants"),
      reporting: covered("restaurants"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "silae",
    positioning: "Paie & production sociale",
    evidence: [
      {
        suffix: "payroll",
        sourceRef: "https://www.silae.fr/solution-rh-paie/logiciel-paie/",
        claim: "Production de la paie, variables, droit social, congés, espace salarié, documents RH, notes de frais et tableaux de bord.",
      },
      {
        suffix: "dsn",
        sourceRef: "https://www.silae.fr/solution-rh-paie/logiciel-paie/dsn/",
        claim: "Génération, contrôle et transmission des DSN.",
      },
      {
        suffix: "api",
        sourceRef: "https://www.silae.fr/api-silae/",
        claim: "API et intégrations pour connecter Silae à d’autres solutions.",
      },
      {
        suffix: "accountants",
        sourceRef: "https://www.silae.fr/wp-content/uploads/Plaquette_Silae_Paie-Expert-Comptable.pdf",
        claim: "Production sociale pour experts-comptables et génération en masse des écritures comptables de paie.",
      },
    ],
    capabilities: {
      payroll_production: covered("payroll"),
      payroll_variables: covered("payroll"),
      payroll_controls: covered("dsn"),
      payroll_declarations: covered("dsn"),
      payroll_legal_updates: covered("payroll"),
      payroll_multi_client: covered("accountants"),
      payroll_accounting_entries: covered("accountants"),
      payroll_leave_absence: covered("payroll"),
      payroll_employee_portal: covered("payroll"),
      payroll_distribution: covered("payroll"),
      payroll_hr_documents: covered("payroll"),
      payroll_expenses: covered("payroll"),
      payroll_onboarding: covered("payroll"),
      reporting: covered("payroll"),
      integrations: covered("api"),
    },
  }),
  buildCapabilityReview({
    resourceSlug: "payfit",
    positioning: "Paie & RH",
    evidence: [
      {
        suffix: "payroll",
        sourceRef: "https://payfit.com/fr/paie-declarations-sociales/",
        claim: "Bulletins de paie, variables et DSN automatisées.",
      },
      {
        suffix: "features",
        sourceRef: "https://payfit.com/fr/toutes-les-fonctionnalites/",
        claim: "Congés, espace employé, documents RH, notes de frais, onboarding, tableaux de bord et intégrations.",
      },
    ],
    capabilities: {
      payroll_production: covered("payroll"),
      payroll_variables: covered("payroll"),
      payroll_declarations: covered("payroll"),
      payroll_leave_absence: covered("features"),
      payroll_employee_portal: covered("features"),
      payroll_distribution: covered("features"),
      payroll_hr_documents: covered("features"),
      payroll_expenses: covered("features"),
      payroll_onboarding: covered("features"),
      reporting: covered("features"),
      integrations: covered("features"),
    },
  }),
];

function buildReviewIndex(
  reviews: readonly ToolCapabilityComparisonReview[],
): ReadonlyMap<string, ToolCapabilityComparisonReview> {
  const index = new Map<string, ToolCapabilityComparisonReview>();
  for (const review of reviews) {
    if (index.has(review.resourceSlug)) {
      throw new Error(`Revue outil dupliquée ${review.resourceSlug}`);
    }
    index.set(review.resourceSlug, review);
  }
  return index;
}

export const TOOL_CAPABILITY_COMPARISON_REVIEW_BY_RESOURCE = buildReviewIndex(
  TOOL_CAPABILITY_COMPARISON_REVIEWS,
);

const TOOL_CAPABILITY_REVIEW_ALIASES: Readonly<Record<string, string>> = {
  "l-addition": "laddition",
};

export function getToolCapabilityComparisonReview(
  resourceSlug: string,
): ToolCapabilityComparisonReview | undefined {
  return TOOL_CAPABILITY_COMPARISON_REVIEW_BY_RESOURCE.get(
    TOOL_CAPABILITY_REVIEW_ALIASES[resourceSlug] ?? resourceSlug,
  );
}

export const REVIEWED_GENERIC_TOOL_COMPARISON_SYSTEM_SLUGS = [
  "batiment",
  "restaurant",
  "gestionnaire-paie-independant",
] as const;

export const REVIEWED_GENERIC_TOOL_COMPARISON_TOOL_SLUGS: Readonly<
  Record<(typeof REVIEWED_GENERIC_TOOL_COMPARISON_SYSTEM_SLUGS)[number], readonly string[]>
> = {
  batiment: ["obat", "costructor", "progbat", "vertuoza"],
  restaurant: [
    "lightspeed",
    "zenchef",
    "deliverect",
    "l-addition",
    "revya",
    "uber-eats",
  ],
  "gestionnaire-paie-independant": ["silae", "payfit"],
};

export function isReviewedGenericToolComparisonSystem(
  systemSlug: string,
): boolean {
  return REVIEWED_GENERIC_TOOL_COMPARISON_SYSTEM_SLUGS.some(
    (reviewedSlug) => reviewedSlug === systemSlug,
  );
}
