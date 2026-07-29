import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const firestore = vi.hoisted(() => {
  const documents = new Map<string, Record<string, unknown>>();
  const database = {
    collection: () => ({
      doc: (id = "generated-lead") => ({
        id,
        set: async (data: Record<string, unknown>) => {
          documents.set(id, data);
        },
      }),
    }),
    runTransaction: async <T,>(
      operation: (transaction: {
        create: (
          reference: { id: string },
          data: Record<string, unknown>,
        ) => void;
        get: (reference: { id: string }) => Promise<{
          data: () => Record<string, unknown> | undefined;
          exists: boolean;
        }>;
      }) => Promise<T>,
    ) =>
      operation({
        create: (reference, data) => {
          documents.set(reference.id, data);
        },
        get: async (reference) => ({
          data: () => documents.get(reference.id),
          exists: documents.has(reference.id),
        }),
      }),
  };

  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => firestore.database,
}));

vi.mock("@/lib/operational-maintenance", () => ({
  getLeadRetentionExpiry: () => "2027-07-29T00:00:00.000Z",
}));

import {
  createLeadRequest,
  resolveStoredLeadAssetSnapshot,
} from "@/lib/lead-storage";

function buildInput(assetRevision: string, workbookVersion: string) {
  return {
    assetSnapshot: { assetRevision, workbookVersion },
    attribution: {
      consent: {
        analytics: false,
        marketing: false,
        status: "pending" as const,
      },
      conversion: {
        browser: null,
        city: null,
        country: null,
        device_type: null,
        os: null,
        page: "/kit-operationnel/batiment",
        region: null,
        request_id: "request-123",
        submitted_at: "2026-07-29T00:00:00.000Z",
        timezone: null,
      },
      first_source: {
        campaign: null,
        confidence: "unknown" as const,
        medium: "unknown",
        source: "direct",
      },
      first_touch: null,
      last_source: {
        campaign: null,
        confidence: "unknown" as const,
        medium: "unknown",
        source: "direct",
      },
      last_touch: null,
      storage: "memory" as const,
      version: 1 as const,
    },
    channels: { email: false, resend: false, slack: false },
    contact: { email: "maya@example.com", firstName: "Maya" },
    context: {
      sectorLabel: "BTP",
      sectorSlug: "btp",
      source: "Livraison du système opérationnel gratuit",
      sourceUrl: "/kit-operationnel/batiment",
      systemName: "Bâtiment",
      systemSlug: "batiment",
    },
    fields: [],
    idempotencyKey: "same-request-after-activation",
    emoji: "📦",
    requestType: "system_kit_request",
    title: "Livraison",
  };
}

describe("lead storage asset snapshots", () => {
  beforeEach(() => {
    firestore.documents.clear();
  });

  it("returns the historical revision for an idempotent duplicate after activation", async () => {
    const first = await createLeadRequest(
      buildInput("d032-v1-2026-07-28", "1.0.0"),
    );
    const duplicate = await createLeadRequest(
      buildInput("d061-v2-pilot-2026-07-29-01", "2.0.0-pilot"),
    );

    expect(first).toEqual(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "d032-v1-2026-07-28",
          workbookVersion: "1.0.0",
        },
        created: true,
      }),
    );
    expect(duplicate).toEqual(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "d032-v1-2026-07-28",
          workbookVersion: "1.0.0",
        },
        created: false,
        id: first.id,
      }),
    );
  });

  it("maps a pre-D061 idempotent duplicate without a snapshot to the explicit v1 revision", async () => {
    const first = await createLeadRequest(
      buildInput("d032-v1-2026-07-28", "1.0.0"),
    );
    const stored = firestore.documents.get(first.id);
    if (!stored) {
      throw new Error("Le lead historique de test est introuvable.");
    }
    firestore.documents.set(first.id, {
      ...stored,
      asset_snapshot: null,
    });

    const duplicate = await createLeadRequest(
      buildInput("d061-v2-pilot-2026-07-29-01", "2.0.0-pilot"),
    );

    expect(duplicate).toEqual(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "d032-v1-2026-07-28",
          workbookVersion: "1.0.0",
        },
        created: false,
        id: first.id,
      }),
    );
  });

  it("never applies the legacy system fallback to another lead type", () => {
    expect(
      resolveStoredLeadAssetSnapshot({
        asset_snapshot: null,
        request_type: "service_request",
      }),
    ).toBeNull();
  });
});
