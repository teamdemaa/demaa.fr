import { isCoachingMessageDraftToken } from "@/lib/coaching-message-draft";
import { isOpportunitySubmissionDraftToken } from "@/lib/opportunity-submission";

const INTENT_PARAM = "intent";
const SAFE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAVED_PLAN_PATH_PATTERN = /^\/plans\/[A-Za-z0-9_-]{1,80}(?:\?[^\r\n]*)?$/;

type CoachingTab = "messages";

export type CustomerAccessIntent =
  | {
      kind: "coaching";
      draftToken?: string;
      tab?: CoachingTab;
    }
  | { kind: "generate-plan" }
  | { kind: "guide-notify"; resourceSlug: string; systemSlug: string }
  | { kind: "opportunity"; opportunityId: string }
  | { kind: "opportunity-submit"; draftToken: string }
  | { kind: "solution-referral"; resourceSlug: string; systemSlug: string }
  | { kind: "structure" }
  | { kind: "structure-problem" }
  | { kind: "team-demaa-profile" };

function isSafeId(value: string | null, maxLength = 120) {
  return Boolean(
    value
      && value.length <= maxLength
      && SAFE_ID_PATTERN.test(value),
  );
}

function normalizeLegacyCustomerPath(candidate: string) {
  if (candidate === "/mon-espace" || candidate.startsWith("/mon-espace?")) {
    return "/plans";
  }

  if (candidate.startsWith("/mon-espace/plans/")) {
    return candidate.replace("/mon-espace/plans/", "/plans/");
  }

  return candidate;
}

export function buildCustomerIntentReturnTo(intent: CustomerAccessIntent) {
  const params = new URLSearchParams({ [INTENT_PARAM]: intent.kind });

  if (intent.kind === "coaching" && intent.tab) {
    params.set("tab", intent.tab);
  }

  if (intent.kind === "coaching" && intent.draftToken) {
    if (!isCoachingMessageDraftToken(intent.draftToken)) {
      throw new Error("Invalid coaching draft intent.");
    }
    params.set("tab", "messages");
    params.set("draftToken", intent.draftToken);
  }

  if (intent.kind === "guide-notify" || intent.kind === "solution-referral") {
    if (!isSafeId(intent.systemSlug) || !isSafeId(intent.resourceSlug)) {
      throw new Error("Invalid guide notification intent.");
    }
    params.set("systemSlug", intent.systemSlug);
    params.set("resourceSlug", intent.resourceSlug);
  }

  if (intent.kind === "opportunity") {
    if (!isSafeId(intent.opportunityId)) {
      throw new Error("Invalid opportunity intent.");
    }
    params.set("opportunityId", intent.opportunityId);
  }

  if (intent.kind === "opportunity-submit") {
    if (!isOpportunitySubmissionDraftToken(intent.draftToken)) {
      throw new Error("Invalid opportunity submission draft intent.");
    }
    params.set("draftToken", intent.draftToken);
  }

  return `/?${params.toString()}`;
}

export function parseCustomerAccessIntent(value?: string | null): CustomerAccessIntent | null {
  const candidate = value?.trim();
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(candidate, "https://demaa.invalid");
  } catch {
    return null;
  }

  if (url.origin !== "https://demaa.invalid") return null;

  const kind = url.searchParams.get(INTENT_PARAM);
  if (
    kind === "generate-plan"
    || kind === "structure"
    || kind === "structure-problem"
    || kind === "team-demaa-profile"
  ) return { kind };

  if (kind === "coaching") {
    const rawTab = url.searchParams.get("tab");
    const draftToken = url.searchParams.get("draftToken");
    const tab: CoachingTab | undefined = rawTab === "messages" ? rawTab : undefined;
    if (rawTab && !tab) return null;
    if (url.searchParams.has("offer")) return null;
    if (draftToken && !isCoachingMessageDraftToken(draftToken)) return null;
    return {
      kind,
      ...(draftToken ? { draftToken } : {}),
      ...(draftToken ? { tab: "messages" as const } : tab ? { tab } : {}),
    };
  }

  if (kind === "guide-notify" || kind === "solution-referral") {
    const systemSlug = url.searchParams.get("systemSlug");
    const resourceSlug = url.searchParams.get("resourceSlug");
    if (!isSafeId(systemSlug) || !isSafeId(resourceSlug)) return null;
    return { kind, systemSlug: systemSlug!, resourceSlug: resourceSlug! };
  }

  if (kind === "opportunity") {
    const opportunityId = url.searchParams.get("opportunityId");
    if (!isSafeId(opportunityId)) return null;
    return { kind, opportunityId: opportunityId! };
  }

  if (kind === "opportunity-submit") {
    const draftToken = url.searchParams.get("draftToken");
    if (!isOpportunitySubmissionDraftToken(draftToken)) return null;
    return { kind, draftToken };
  }

  return null;
}

export function getSafeCustomerReturnTo(value?: string | null) {
  const rawCandidate = value?.trim();

  if (
    !rawCandidate
    || !rawCandidate.startsWith("/")
    || rawCandidate.startsWith("//")
    || rawCandidate.includes("\\")
    || /[\r\n]/.test(rawCandidate)
  ) {
    return "/";
  }

  const candidate = normalizeLegacyCustomerPath(rawCandidate);
  const parsedIntent = parseCustomerAccessIntent(candidate);
  if (SAVED_PLAN_PATH_PATTERN.test(candidate)) {
    return candidate.includes(`${INTENT_PARAM}=`) && !parsedIntent
      ? "/"
      : candidate;
  }

  if (candidate.includes(`${INTENT_PARAM}=`)) {
    return parsedIntent ? buildCustomerIntentReturnTo(parsedIntent) : "/";
  }

  if (candidate === "/" || candidate.startsWith("/?")) return candidate;
  if (candidate === "/plans") return candidate;
  return "/";
}
