import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const firestore = vi.hoisted(() => {
  const queries: Array<{
    collection: string;
    field: string;
    limit: number;
    operator: string;
    value: string;
  }> = [];

  return {
    database: {
      collection(collection: string) {
        return {
          where(field: string, operator: string, value: string) {
            return {
              limit(limit: number) {
                queries.push({ collection, field, limit, operator, value });
                return {
                  async get() {
                    return { empty: true };
                  },
                };
              },
            };
          },
        };
      },
    },
    queries,
  };
});

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => firestore.database,
}));

import { cleanupExpiredOperationalData } from "@/lib/operational-maintenance";

describe("coaching draft retention", () => {
  beforeEach(() => {
    firestore.queries.length = 0;
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-13T10:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("includes expired specialist drafts in operational cleanup", async () => {
    const result = await cleanupExpiredOperationalData(7);

    expect(firestore.queries).toContainEqual({
      collection: "coaching_message_drafts",
      field: "expires_at",
      limit: 7,
      operator: "<=",
      value: "2026-08-13T10:00:00.000Z",
    });
    expect(firestore.queries).toContainEqual({
      collection: "opportunity_submission_drafts",
      field: "expires_at",
      limit: 7,
      operator: "<=",
      value: "2026-08-13T10:00:00.000Z",
    });
    expect(result).toEqual({ deleted: 0, operations: 14 });
  });

  it("documents the temporary draft and its retention without naming its access mechanism", () => {
    const privacy = readFileSync(
      "src/app/(marketing)/politique-de-confidentialite/page.tsx",
      "utf8",
    );

    expect(privacy).toContain(
      "Brouillon de message destiné à un spécialiste avant connexion",
    );
    expect(privacy).toContain("utilisable pendant 60 minutes maximum");
    expect(privacy).toContain("des brouillons temporaires");
    expect(privacy).toContain(
      "Brouillon de proposition d&apos;opportunité avant connexion",
    );
    expect(privacy).toContain("utilisable pendant 2 heures maximum");
    expect(privacy).not.toContain("draftToken");
    expect(privacy).not.toContain("jeton du brouillon");
  });
});
