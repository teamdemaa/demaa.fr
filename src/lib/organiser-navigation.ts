const SAFE_ORGANISER_VALUE = /^[A-Za-z0-9_-]{1,160}$/;

type SearchValue = string | string[] | undefined;
type SearchInput = URLSearchParams | Record<string, SearchValue>;

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function readValue(input: SearchInput, key: string) {
  return input instanceof URLSearchParams
    ? input.get(key) ?? undefined
    : firstValue(input[key]);
}

function safeValue(value: string | undefined) {
  return value && SAFE_ORGANISER_VALUE.test(value) ? value : undefined;
}

export type OrganiserTab = "solutions" | "processus";

export function parseOrganiserTab(value: SearchValue): OrganiserTab {
  return firstValue(value) === "processus" ? "processus" : "solutions";
}

export function buildOrganiserHref(input: {
  tab?: OrganiserTab;
  systemId?: string;
  solutionResourceSlug?: string;
  solutionEntrySource?: "action_recommendation";
} = {}) {
  const tab = input.tab ?? "solutions";
  const params = new URLSearchParams();

  params.set("tab", tab);
  if (tab === "solutions") {
    const systemId = safeValue(input.systemId);
    const resource = safeValue(input.solutionResourceSlug);
    if (systemId) params.set("system", systemId);
    if (resource) params.set("resource", resource);
    if (input.solutionEntrySource === "action_recommendation") {
      params.set("toolSource", input.solutionEntrySource);
    }
  }

  return `/organiser?${params.toString()}`;
}

export function buildLegacySolutionsRedirect(input: SearchInput) {
  const view = readValue(input, "view");
  const section = readValue(input, "section");
  const planTab = readValue(input, "planTab");
  const intent = readValue(input, "intent");
  const isLegacySolutionsEntry = view === "solutions"
    || view === "system"
    || (view === "plan" && (section === "solutions" || planTab === "solutions"))
    || intent === "solution-referral";

  if (!isLegacySolutionsEntry) return null;

  return buildOrganiserHref({
    tab: "solutions",
    systemId: safeValue(
      readValue(input, "system")
        ?? (intent === "solution-referral" ? readValue(input, "systemSlug") : undefined),
    ),
    solutionResourceSlug: safeValue(
      readValue(input, "resource")
        ?? (intent === "solution-referral" ? readValue(input, "resourceSlug") : undefined),
    ),
    solutionEntrySource: readValue(input, "toolSource") === "action_recommendation"
      ? "action_recommendation"
      : undefined,
  });
}
