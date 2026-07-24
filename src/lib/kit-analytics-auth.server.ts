import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const KIT_ANALYTICS_SESSION_COOKIE = "demaa_kit_analytics_session";

const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;
const SESSION_PAYLOAD = "demaa-kit-analytics-dashboard-v1";

function getDashboardPassword() {
  return process.env.KIT_ANALYTICS_DASHBOARD_PASSWORD?.trim() || null;
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function isKitAnalyticsDashboardConfigured() {
  return Boolean(getDashboardPassword());
}

export function isKitAnalyticsPasswordValid(candidate: string) {
  const password = getDashboardPassword();
  return password ? safeCompare(candidate, password) : false;
}

export function createKitAnalyticsSessionToken() {
  const password = getDashboardPassword();
  if (!password) return null;

  return createHmac("sha256", password)
    .update(SESSION_PAYLOAD)
    .digest("base64url");
}

export function isKitAnalyticsSessionValid(candidate?: string | null) {
  const expected = createKitAnalyticsSessionToken();
  return expected && candidate ? safeCompare(candidate, expected) : false;
}

export function getKitAnalyticsCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    maxAge,
    path: "/suivi-kits",
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
