import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createKitAnalyticsSessionToken,
  isKitAnalyticsDashboardConfigured,
  isKitAnalyticsPasswordValid,
  isKitAnalyticsSessionValid,
} from "@/lib/kit-analytics-auth.server";

describe("kit analytics dashboard authentication", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stays disabled when no dashboard password is configured", () => {
    vi.stubEnv("KIT_ANALYTICS_DASHBOARD_PASSWORD", "");

    expect(isKitAnalyticsDashboardConfigured()).toBe(false);
    expect(isKitAnalyticsPasswordValid("anything")).toBe(false);
    expect(createKitAnalyticsSessionToken()).toBeNull();
  });

  it("creates and validates a password-derived session token", () => {
    vi.stubEnv(
      "KIT_ANALYTICS_DASHBOARD_PASSWORD",
      "a-long-private-dashboard-password",
    );

    const sessionToken = createKitAnalyticsSessionToken();

    expect(isKitAnalyticsDashboardConfigured()).toBe(true);
    expect(isKitAnalyticsPasswordValid("a-long-private-dashboard-password")).toBe(true);
    expect(isKitAnalyticsPasswordValid("wrong-password")).toBe(false);
    expect(isKitAnalyticsSessionValid(sessionToken)).toBe(true);
    expect(isKitAnalyticsSessionValid("invalid-session")).toBe(false);
  });
});
