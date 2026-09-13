export const businessActivityOptions = [
  { id: "btp-maintenance", label: "BTP, installation et maintenance", group: "Entreprises de services", model: "ebe" },
  { id: "nettoyage-securite", label: "Nettoyage, entretien et sécurité", group: "Entreprises de services", model: "ebe" },
  { id: "cabinet-comptable", label: "Cabinet comptable", group: "Entreprises de services", model: "cabinet" },
  { id: "cabinet-conseil", label: "Cabinet de conseil ou d’expertise", group: "Entreprises de services", model: "ebe" },
  { id: "agence-services", label: "Agence et services créatifs", group: "Entreprises de services", model: "ebe" },
  { id: "formation-recrutement", label: "Formation et recrutement", group: "Entreprises de services", model: "ebe" },
  { id: "esn-infogerance", label: "Services informatiques, ESN ou infogérance", group: "Entreprises de services", model: "hybrid" },
  { id: "autres-services-b2b", label: "Autres services B2B", group: "Entreprises de services", model: "ebe" },
  { id: "saas-b2b", label: "Logiciel métier ou SaaS B2B", group: "Logiciels", model: "arr" },
  { id: "logiciel-licence", label: "Logiciel sous licence", group: "Logiciels", model: "software" },
] as const;

export type BusinessActivityId = (typeof businessActivityOptions)[number]["id"];
export type BusinessValuationModel = (typeof businessActivityOptions)[number]["model"];
export type QualitativeLevel = "very_high" | "high" | "moderate" | "low";

export type BusinessValuationInput = {
  activityId: BusinessActivityId;
  revenue?: number;
  ebe?: number;
  arr?: number;
  growth?: number;
  churn?: number;
  grossMargin?: number;
  recurrence: QualitativeLevel;
  concentration: QualitativeLevel;
  autonomy: QualitativeLevel;
  dependence: QualitativeLevel;
};

export type BusinessValuationResult = {
  activityLabel: string;
  methodLabel: string;
  low: number;
  central: number;
  high: number;
  factors: string[];
};

const qualitativeLevels = new Set<QualitativeLevel>(["very_high", "high", "moderate", "low"]);
const activityIds = new Set<BusinessActivityId>(businessActivityOptions.map(({ id }) => id));

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function normalizeBusinessValuationInput(value: unknown): BusinessValuationInput | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (!activityIds.has(candidate.activityId as BusinessActivityId)) return null;
  if (![candidate.recurrence, candidate.concentration, candidate.autonomy, candidate.dependence].every((level) => qualitativeLevels.has(level as QualitativeLevel))) return null;
  return {
    activityId: candidate.activityId as BusinessActivityId,
    revenue: finiteNumber(candidate.revenue),
    ebe: finiteNumber(candidate.ebe),
    arr: finiteNumber(candidate.arr),
    growth: finiteNumber(candidate.growth),
    churn: finiteNumber(candidate.churn),
    grossMargin: finiteNumber(candidate.grossMargin),
    recurrence: candidate.recurrence as QualitativeLevel,
    concentration: candidate.concentration as QualitativeLevel,
    autonomy: candidate.autonomy as QualitativeLevel,
    dependence: candidate.dependence as QualitativeLevel,
  };
}

export function getBusinessValuationModel(activityId: BusinessActivityId): BusinessValuationModel {
  return businessActivityOptions.find((option) => option.id === activityId)?.model ?? "ebe";
}

export function calculateBusinessValuation(input: BusinessValuationInput): BusinessValuationResult {
  const activity = businessActivityOptions.find((option) => option.id === input.activityId);
  if (!activity) throw new Error("Activité non reconnue.");

  const { central: financialCentral, methodLabel, financialAdjustment, financialFactors } = calculateFinancialBase(activity.model, input);
  const quality = calculateQualityAdjustment(input);
  const adjustedCentral = financialCentral * clamp(1 + financialAdjustment + quality.adjustment, 0.6, 1.45);
  const central = roundValuation(adjustedCentral);

  return {
    activityLabel: activity.label,
    methodLabel,
    low: roundValuation(central * 0.85),
    central,
    high: roundValuation(central * 1.15),
    factors: [...financialFactors, ...quality.factors],
  };
}

function calculateFinancialBase(model: BusinessValuationModel, input: BusinessValuationInput) {
  if (model === "cabinet") {
    const ebe = requirePositive(input.ebe, "L’EBE retraité est requis.");
    const revenue = requirePositive(input.revenue, "Le chiffre d’affaires est requis.");
    return {
      central: ebe * 2.8 * 0.6 + revenue * 0.87 * 0.4,
      methodLabel: "EBE retraité, contrôlé par le chiffre d’affaires",
      financialAdjustment: 0,
      financialFactors: ["Référence centrale de 2,8 fois l’EBE retraité", "Contrôle complémentaire à partir du chiffre d’affaires"],
    };
  }

  if (model === "arr" || model === "software") {
    const arr = requirePositive(input.arr, "Le revenu annuel récurrent est requis.");
    requireFinite(input.growth, "La croissance annuelle est requise.");
    requirePercentage(input.churn, "Le churn annuel doit être compris entre 0 et 100 %.");
    requirePercentage(input.grossMargin, "La marge brute doit être comprise entre 0 et 100 %.");
    const baseMultiple = model === "arr" ? 2.5 : 2.2;
    const adjustment = calculateSoftwareAdjustment(input);
    return {
      central: arr * baseMultiple,
      methodLabel: model === "arr" ? "Multiple du revenu annuel récurrent" : "Revenus logiciels récurrents et rentabilité",
      financialAdjustment: adjustment.adjustment,
      financialFactors: [`Référence centrale de ${String(baseMultiple).replace(".", ",")} fois le revenu annuel récurrent`, ...adjustment.factors],
    };
  }

  const ebe = requirePositive(input.ebe, "L’EBE retraité est requis.");
  return {
    central: ebe * (model === "hybrid" ? 3.2 : 3),
    methodLabel: model === "hybrid" ? "EBE retraité et récurrence des contrats" : "Multiple de l’EBE retraité",
    financialAdjustment: 0,
    financialFactors: [model === "hybrid" ? "Référence centrale de 3,2 fois l’EBE retraité" : "Référence centrale de 3 fois l’EBE retraité"],
  };
}

function calculateSoftwareAdjustment(input: BusinessValuationInput) {
  let adjustment = 0;
  const factors: string[] = [];
  if ((input.growth ?? 0) >= 30) { adjustment += 0.15; factors.push("Croissance annuelle supérieure ou égale à 30 %"); }
  else if ((input.growth ?? 0) >= 15) { adjustment += 0.08; factors.push("Croissance annuelle supérieure ou égale à 15 %"); }
  else if ((input.growth ?? 0) < 0) { adjustment -= 0.12; factors.push("Revenus en diminution"); }

  if ((input.churn ?? 100) <= 5) { adjustment += 0.1; factors.push("Churn annuel inférieur ou égal à 5 %"); }
  else if ((input.churn ?? 100) <= 10) { adjustment += 0.03; factors.push("Churn annuel inférieur ou égal à 10 %"); }
  else if ((input.churn ?? 0) > 20) { adjustment -= 0.15; factors.push("Churn annuel supérieur à 20 %"); }

  if ((input.grossMargin ?? 0) >= 80) { adjustment += 0.08; factors.push("Marge brute supérieure ou égale à 80 %"); }
  else if ((input.grossMargin ?? 0) >= 65) { adjustment += 0.03; factors.push("Marge brute supérieure ou égale à 65 %"); }
  else if ((input.grossMargin ?? 100) < 50) { adjustment -= 0.1; factors.push("Marge brute inférieure à 50 %"); }
  return { adjustment, factors };
}

function calculateQualityAdjustment(input: BusinessValuationInput) {
  const recurrence = { very_high: 0.12, high: 0.06, moderate: 0, low: -0.08 }[input.recurrence];
  const concentration = { very_high: -0.15, high: -0.08, moderate: 0, low: 0.08 }[input.concentration];
  const autonomy = { very_high: 0.1, high: 0.05, moderate: 0, low: -0.1 }[input.autonomy];
  const dependence = { very_high: -0.15, high: -0.08, moderate: 0, low: 0.08 }[input.dependence];
  const factors: string[] = [];
  if (recurrence > 0) factors.push("Revenus récurrents importants");
  if (recurrence < 0) factors.push("Revenus peu récurrents");
  if (concentration > 0) factors.push("Clientèle diversifiée");
  if (concentration < 0) factors.push("Concentration de la clientèle");
  if (autonomy > 0) factors.push("Équipe autonome");
  if (autonomy < 0) factors.push("Équipe encore peu autonome");
  if (dependence > 0) factors.push("Faible dépendance au dirigeant");
  if (dependence < 0) factors.push("Dépendance importante au dirigeant");
  return { adjustment: clamp(recurrence + concentration + autonomy + dependence, -0.28, 0.28), factors };
}

function requirePositive(value: number | undefined, message: string) {
  if (!value || value <= 0) throw new Error(message);
  return value;
}

function requireFinite(value: number | undefined, message: string) {
  if (value === undefined || !Number.isFinite(value)) throw new Error(message);
  return value;
}

function requirePercentage(value: number | undefined, message: string) {
  const percentage = requireFinite(value, message);
  if (percentage < 0 || percentage > 100) throw new Error(message);
  return percentage;
}

function roundValuation(value: number) {
  const increment = value >= 500_000 ? 5_000 : 1_000;
  return Math.max(increment, Math.round(value / increment) * increment);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
