export const COACHING_MESSAGE_DRAFT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isCoachingMessageDraftToken(
  value: unknown,
): value is string {
  return typeof value === "string"
    && COACHING_MESSAGE_DRAFT_TOKEN_PATTERN.test(value);
}
