export type CoachingMessageAuthor = "customer" | "specialist";

export type CoachingMessage = Readonly<{
  author: CoachingMessageAuthor;
  body: string;
  createdAt: string;
  id: string;
}>;
export type CoachingRecommendationStatus =
  | "closed"
  | "connected"
  | "recommended"
  | "requested"
  | "withdrawn";
export type CoachingRecommendation = Readonly<{
  category: string;
  connectionProcess: string;
  createdAt: string;
  description: string;
  id: string;
  included: readonly string[];
  limits: readonly string[];
  messageId: string;
  name: string;
  needKey: string | null;
  needLabel: string | null;
  requestedAt: string | null;
  resourceVersion: string;
  status: CoachingRecommendationStatus;
}>;
export type CoachingRecommendationCatalogOption = Readonly<{
  category: string;
  name: string;
  needs: readonly Readonly<{ key: string; label: string }>[];
  slug: string;
}>;
export type CoachingFreeStatus = "available" | "open" | "completed";
export const COACHING_REVIEW_DELAY_MS = 30 * 24 * 60 * 60 * 1_000;

export function isCoachingReviewOverdue(
  openedAt: string | null,
  now = Date.now(),
) {
  if (!openedAt) return false;
  const openedAtMs = Date.parse(openedAt);
  return Number.isFinite(openedAtMs)
    && now - openedAtMs >= COACHING_REVIEW_DELAY_MS;
}

export type CoachingAccess = Readonly<{
  canSend: boolean;
  freeStatus: CoachingFreeStatus;
}>;
export type CoachingConversationSummary = Readonly<{
  freeStatus: CoachingFreeStatus;
  customerEmail: string;
  id: string;
  lastMessage: string;
  openedAt: string | null;
  updatedAt: string;
  localeCode: "fr" | "en";
  marketCode: string;
  countryCode: string | null;
  source: string;
}>;
