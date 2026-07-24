import { describe, expect, it } from "vitest";
import {
  aggregateConfirmedKitHistory,
} from "../scripts/lib/kit-history-aggregation.mjs";

describe("kit history aggregation", () => {
  it("deduplicates confirmed evidence and excludes an unconfirmed lead", () => {
    const result = aggregateConfirmedKitHistory({
      leadRequests: [
        {
          contact: { email: "lea@example.com" },
          context: { system_slug: "freelance" },
          notification_status: { kit_email: { status: "sent" } },
        },
        {
          contact: { email: "sam@example.com" },
          context: { system_slug: "restaurant" },
          notification_status: { kit_email: { status: "pending" } },
        },
      ],
      legacySubscribers: [
        {
          email: "alex@example.com",
          source: "systeme_kit_cabinet-comptable",
        },
        {
          email: "newsletter@example.com",
          source: "newsletter_home_section",
        },
      ],
      sequences: [
        {
          email: "LEA@example.com",
          sequence_type: "kit_systeme",
          system_slug: "freelance",
        },
      ],
    });

    expect(result).toEqual({
      excludedUnconfirmedLeadPairs: 1,
      perKit: {
        "cabinet-comptable": 1,
        freelance: 1,
      },
      sourcePairCounts: {
        currentKitSequences: 1,
        legacyKitSubscribers: 1,
        sentKitEmails: 1,
      },
      uniqueKitDownloads: 2,
      uniquePeople: 2,
    });
  });

  it("counts two different kits for one person while keeping one unique person", () => {
    const result = aggregateConfirmedKitHistory({
      legacySubscribers: [
        {
          email: "alex@example.com",
          source: "systeme_kit_cabinet-comptable",
        },
        {
          email: "alex@example.com",
          source: "systeme_kit_cabinet-davocat",
        },
      ],
    });

    expect(result.uniqueKitDownloads).toBe(2);
    expect(result.uniquePeople).toBe(1);
  });
});
