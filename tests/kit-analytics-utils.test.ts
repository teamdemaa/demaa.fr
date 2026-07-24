import { describe, expect, it } from "vitest";
import {
  buildKitTrackingUrl,
  getDateKeysForPeriod,
  getParisDateKey,
  getPeriodStartDateKey,
  normalizeKitAnalyticsPeriod,
  resolveKitOpenAttribution,
  shouldCountKitOpen,
} from "@/lib/kit-analytics-utils";

describe("kit analytics utilities", () => {
  it("builds the first-party tracking URL for a kit", () => {
    expect(buildKitTrackingUrl("cabinet-comptable")).toBe(
      "/api/kits/cabinet-comptable/open",
    );
  });

  it("accepts only supported dashboard periods", () => {
    expect(normalizeKitAnalyticsPeriod("7")).toBe(7);
    expect(normalizeKitAnalyticsPeriod(["90"])).toBe(90);
    expect(normalizeKitAnalyticsPeriod("365")).toBe(30);
    expect(normalizeKitAnalyticsPeriod(undefined)).toBe(30);
  });

  it("uses Europe/Paris calendar dates for daily counters", () => {
    const now = new Date("2026-07-24T22:30:00.000Z");

    expect(getParisDateKey(now)).toBe("2026-07-25");
    expect(getPeriodStartDateKey(7, now)).toBe("2026-07-19");
    expect(getDateKeysForPeriod(3, now)).toEqual([
      "2026-07-23",
      "2026-07-24",
      "2026-07-25",
    ]);
  });

  it("keeps only aggregate UTM and path information from the referrer", () => {
    expect(
      resolveKitOpenAttribution(
        "https://demaa.fr/kit-operationnel/batiment?utm_source=linkedin&utm_medium=social&utm_campaign=ete&email=secret@example.com",
        "demaa.fr",
      ),
    ).toEqual({
      campaign: "ete",
      entryPath: "/kit-operationnel/batiment",
      medium: "social",
      source: "linkedin",
    });
  });

  it("does not count browser or Next.js prefetch requests", () => {
    expect(
      shouldCountKitOpen(new Request("https://demaa.fr/api/kits/batiment/open")),
    ).toBe(true);
    expect(
      shouldCountKitOpen(new Request("https://demaa.fr/api/kits/batiment/open", {
        headers: { purpose: "prefetch" },
      })),
    ).toBe(false);
    expect(
      shouldCountKitOpen(new Request("https://demaa.fr/api/kits/batiment/open", {
        headers: { "next-router-prefetch": "1" },
      })),
    ).toBe(false);
  });
});
