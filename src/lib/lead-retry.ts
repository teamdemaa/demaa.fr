export const MAX_LEAD_DELIVERY_ATTEMPTS = 4;

export function getLeadRetryDelayMs(attemptCount: number) {
  const normalizedAttempt = Number.isFinite(attemptCount)
    ? Math.max(1, Math.floor(attemptCount))
    : 1;
  return Math.min(
    24 * 60 * 60 * 1000,
    15 * 60 * 1000 * 2 ** Math.max(0, normalizedAttempt - 1),
  );
}
