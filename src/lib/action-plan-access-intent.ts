import type { CompanyMonth } from "@/lib/company-pilotage-contract";
import { companyMonthSchema } from "@/lib/company-pilotage-contract";
import type { InterfaceLocaleCode } from "@/lib/international-context";

export const ACTION_PLAN_ACCESS_INTENT_NAMES = [
  "add-manual-action",
  "edit-company-metric",
] as const;

export type ActionPlanAccessIntent =
  | { kind: "add-manual-action" }
  | { kind: "edit-company-metric"; period: CompanyMonth };

type SearchValue = string | string[] | undefined;
type SearchInput = URLSearchParams | Record<string, SearchValue>;

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function readSearchValue(input: SearchInput, key: string) {
  return input instanceof URLSearchParams
    ? input.get(key) ?? undefined
    : firstValue(input[key]);
}

export function parseActionPlanAccessIntent(
  input: SearchInput,
): ActionPlanAccessIntent | null {
  const kind = readSearchValue(input, "intent");
  if (kind === "add-manual-action") return { kind };
  if (kind !== "edit-company-metric") return null;

  const period = companyMonthSchema.safeParse(readSearchValue(input, "period"));
  return period.success ? { kind, period: period.data } : null;
}

export function buildActionPlanAccessReturnTo(
  localeCode: InterfaceLocaleCode,
  intent: ActionPlanAccessIntent,
) {
  const params = new URLSearchParams({ intent: intent.kind });
  if (intent.kind === "edit-company-metric") {
    params.set("period", intent.period);
  }
  return `${localeCode === "en" ? "/en" : "/"}?${params.toString()}`;
}
