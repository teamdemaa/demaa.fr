import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getPublishedSystemDiscoveryTerms } from "@/lib/system-discovery";

export type ActionPlanSystemOption = Readonly<{
  id: string;
  label: string;
  aliases: readonly string[];
}>;

function uniqueNonEmpty(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/**
 * Catalogue volontairement leger transmis au modele pour identifier le systeme.
 * Les processus, solutions et ressources ne sont jamais inclus dans ce payload.
 */
export const actionPlanSystemOptions: readonly ActionPlanSystemOption[] =
  enterpriseCatalog.map((enterprise) => ({
    id: enterprise.slug,
    label: enterprise.name,
    aliases: uniqueNonEmpty([
      ...enterprise.tags,
      ...getPublishedSystemDiscoveryTerms(enterprise.slug)
        .filter((term) => term.status === "published" && term.kind !== "problem")
        .map((term) => term.value),
    ]),
  }));

const actionPlanSystemIds = new Set(
  actionPlanSystemOptions.map(({ id }) => id),
);

if (actionPlanSystemOptions.length !== 115 || actionPlanSystemIds.size !== 115) {
  throw new Error(
    "Le catalogue leger du plan d'action doit contenir exactement 115 systemes uniques.",
  );
}

export function isActionPlanSystemId(value: string) {
  return actionPlanSystemIds.has(value);
}
