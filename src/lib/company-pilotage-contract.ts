import { z } from "zod";

export const COMPANY_METRICS_MAX_MONTHS = 24;
export const COMPANY_STRATEGY_ANSWER_MAX_LENGTH = 500;

export const companyMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export type CompanyMonth = z.infer<typeof companyMonthSchema>;

export function shiftCompanyMonth(period: CompanyMonth, offset: number) {
  const [year, month] = period.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}` as CompanyMonth;
}

export function getCurrentCompanyMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find(({ type }) => type === "year")?.value;
  const month = parts.find(({ type }) => type === "month")?.value;
  return companyMonthSchema.parse(`${year}-${month}`);
}

export function enumerateCompanyMonths(from: CompanyMonth, to: CompanyMonth) {
  if (from > to) throw new Error("La période de début doit précéder la période de fin.");
  const periods: CompanyMonth[] = [];
  let current = from;
  while (current <= to && periods.length <= COMPANY_METRICS_MAX_MONTHS) {
    periods.push(current);
    current = shiftCompanyMonth(current, 1);
  }
  if (periods.length > COMPANY_METRICS_MAX_MONTHS || current <= to) {
    throw new Error(`Une période ne peut pas dépasser ${COMPANY_METRICS_MAX_MONTHS} mois.`);
  }
  return periods;
}

const nullableCents = z.number().int().nullable();

export const companyMonthlyMetricSchema = z.object({
  period: companyMonthSchema,
  revenueCents: nullableCents.refine((value) => value === null || value >= 0),
  expensesCents: nullableCents.refine((value) => value === null || value >= 0),
  cashBalanceCents: nullableCents,
  currency: z.literal("EUR"),
  revision: z.number().int().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

export type CompanyMonthlyMetric = z.infer<typeof companyMonthlyMetricSchema>;

export const companyMetricWriteSchema = z.object({
  expectedRevision: z.number().int().min(0),
  revenueCents: nullableCents.refine((value) => value === null || value >= 0),
  expensesCents: nullableCents.refine((value) => value === null || value >= 0),
  cashBalanceCents: nullableCents,
}).strict();

export type CompanyMetricWrite = z.infer<typeof companyMetricWriteSchema>;

export type CompanyMetricsSummary = Readonly<{
  monthCount: number;
  completedMonthCount: number;
  revenueCents: number | null;
  expensesCents: number | null;
  resultCents: number | null;
  cashBalanceCents: number | null;
}>;

export function getCompanyMetricResult(metric: CompanyMonthlyMetric) {
  return metric.revenueCents === null || metric.expensesCents === null
    ? null
    : metric.revenueCents - metric.expensesCents;
}

export function summarizeCompanyMetrics(
  periods: readonly CompanyMonth[],
  metrics: readonly CompanyMonthlyMetric[],
): CompanyMetricsSummary {
  const byPeriod = new Map(metrics.map((metric) => [metric.period, metric]));
  const selected = periods.map((period) => byPeriod.get(period));
  const revenueComplete = selected.every((metric) => metric?.revenueCents != null);
  const expensesComplete = selected.every((metric) => metric?.expensesCents != null);
  const completedMonthCount = selected.filter(
    (metric) => metric?.revenueCents != null
      && metric.expensesCents != null
      && metric.cashBalanceCents != null,
  ).length;
  const latestCash = [...selected]
    .reverse()
    .find((metric) => metric?.cashBalanceCents != null)?.cashBalanceCents ?? null;
  const revenueCents = revenueComplete
    ? selected.reduce((total, metric) => total + (metric?.revenueCents ?? 0), 0)
    : null;
  const expensesCents = expensesComplete
    ? selected.reduce((total, metric) => total + (metric?.expensesCents ?? 0), 0)
    : null;

  return {
    monthCount: periods.length,
    completedMonthCount,
    revenueCents,
    expensesCents,
    resultCents: revenueCents === null || expensesCents === null
      ? null
      : revenueCents - expensesCents,
    cashBalanceCents: latestCash,
  };
}

export const companyStrategyPillarSchema = z.enum([
  "alignment",
  "positioning",
  "offer",
  "promotion",
]);

export type CompanyStrategyPillar = z.infer<typeof companyStrategyPillarSchema>;

export const companyStrategyAnswerKeySchema = z.enum([
  "alignment_1",
  "alignment_2",
  "alignment_3",
  "positioning_1",
  "positioning_2",
  "positioning_3",
  "offer_1",
  "offer_2",
  "offer_3",
  "promotion_1",
  "promotion_2",
  "promotion_3",
]);

export type CompanyStrategyAnswerKey = z.infer<typeof companyStrategyAnswerKeySchema>;
export type CompanyStrategyAnswers = Record<CompanyStrategyAnswerKey, string>;

const answerSchema = z.string().max(COMPANY_STRATEGY_ANSWER_MAX_LENGTH);

export const companyStrategyAnswersSchema = z.object({
  alignment_1: answerSchema,
  alignment_2: answerSchema,
  alignment_3: answerSchema,
  positioning_1: answerSchema,
  positioning_2: answerSchema,
  positioning_3: answerSchema,
  offer_1: answerSchema,
  offer_2: answerSchema,
  offer_3: answerSchema,
  promotion_1: answerSchema,
  promotion_2: answerSchema,
  promotion_3: answerSchema,
}).strict();

export const EMPTY_COMPANY_STRATEGY_ANSWERS: CompanyStrategyAnswers = {
  alignment_1: "",
  alignment_2: "",
  alignment_3: "",
  positioning_1: "",
  positioning_2: "",
  positioning_3: "",
  offer_1: "",
  offer_2: "",
  offer_3: "",
  promotion_1: "",
  promotion_2: "",
  promotion_3: "",
};

export const COMPANY_STRATEGY_PILLARS = [
  {
    key: "alignment",
    label: "Alignement",
    framing: "Vos ambitions, vos forces et votre rôle.",
    questions: [
      { key: "alignment_1", label: "Qu’est-ce que vous voulez que cette entreprise vous apporte ?" },
      { key: "alignment_2", label: "Qu’est-ce que vous faites particulièrement bien, et comment le savez-vous ?" },
      { key: "alignment_3", label: "Qu’est-ce que vous voulez continuer à faire vous-même, et qu’est-ce qui doit fonctionner sans vous ?" },
    ],
  },
  {
    key: "positioning",
    label: "Positionnement",
    framing: "Pour qui et avec quel angle ?",
    questions: [
      { key: "positioning_1", label: "Qui voulez-vous servir en priorité ?" },
      { key: "positioning_2", label: "Quel problème important résolvez-vous pour eux ?" },
      { key: "positioning_3", label: "Qu’est-ce qui distingue votre manière de résoudre ce problème ?" },
    ],
  },
  {
    key: "offer",
    label: "Offre",
    framing: "Quel résultat est vendu et comment gagne-t-on de l’argent ?",
    questions: [
      { key: "offer_1", label: "Quel résultat concret le client vient-il chercher ?" },
      { key: "offer_2", label: "Que comprend exactement l’offre ?" },
      { key: "offer_3", label: "À quel prix et comment est-elle facturée ?" },
    ],
  },
  {
    key: "promotion",
    label: "Promotion",
    framing: "Comment attirer, convertir et fidéliser ?",
    questions: [
      { key: "promotion_1", label: "Comment les bons clients vous découvrent-ils ?" },
      { key: "promotion_2", label: "Qu’est-ce qui les aide à passer à l’achat ?" },
      { key: "promotion_3", label: "Comment entretenez-vous la relation pour favoriser le réachat et la recommandation ?" },
    ],
  },
] as const satisfies readonly {
  key: CompanyStrategyPillar;
  label: string;
  framing: string;
  questions: readonly { key: CompanyStrategyAnswerKey; label: string }[];
}[];

export const companyStrategyCycleSchema = z.object({
  id: z.string().min(1).max(160),
  status: z.enum(["active", "archived"]),
  startMonth: companyMonthSchema,
  endMonth: companyMonthSchema,
  answers: companyStrategyAnswersSchema,
  revision: z.number().int().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  archivedAt: z.string().datetime().nullable(),
}).strict();

export type CompanyStrategyCycle = z.infer<typeof companyStrategyCycleSchema>;

export const companyStrategyUpdateSchema = z.object({
  expectedRevision: z.number().int().min(1),
  pillar: companyStrategyPillarSchema,
  answers: companyStrategyAnswersSchema.partial(),
}).strict().superRefine((value, context) => {
  const allowedPrefix = `${value.pillar}_`;
  const keys = Object.keys(value.answers);
  if (keys.length === 0 || keys.some((key) => !key.startsWith(allowedPrefix))) {
    context.addIssue({ code: "custom", message: "Les réponses doivent appartenir à un seul pilier.", path: ["answers"] });
  }
});

export type CompanyStrategyUpdate = z.infer<typeof companyStrategyUpdateSchema>;

export function mergeCompanyStrategyAnswers(input: {
  base: CompanyStrategyAnswers;
  local: CompanyStrategyAnswers;
  remote: CompanyStrategyAnswers;
}) {
  const merged = { ...input.remote };
  const conflicts: CompanyStrategyAnswerKey[] = [];
  for (const key of companyStrategyAnswerKeySchema.options) {
    const localChanged = input.local[key] !== input.base[key];
    const remoteChanged = input.remote[key] !== input.base[key];
    if (localChanged && remoteChanged && input.local[key] !== input.remote[key]) {
      conflicts.push(key);
      merged[key] = input.local[key];
    } else if (localChanged) {
      merged[key] = input.local[key];
    }
  }
  return { merged, conflicts };
}

export function formatCompanyMonth(period: CompanyMonth) {
  const [year, month] = period.split("-").map(Number);
  const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
