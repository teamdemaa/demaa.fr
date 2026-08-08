import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  getActiveDeliverySnapshot: vi.fn(),
  getEnterpriseBySlug: vi.fn(),
  getLeadDeliveryState: vi.fn(),
  getLevierAssetSnapshot: vi.fn(),
  getPublishedSolutionPlacements: vi.fn(),
  hasEditableOperationalSystemAsset: vi.fn(),
  resolveLeadContext: vi.fn(),
  sendDeliveryEmail: vi.fn(),
  submitLeadRequest: vi.fn(),
  updateLeadDeliveryStatus: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeIdempotencyKey: (value: unknown) =>
    typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, maxLength: number) =>
    typeof value === "string"
      ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
      : "",
  readJsonBody: async <T,>(request: Request) => ({
    data: (await request.json()) as T,
    response: null,
  }),
}));

vi.mock("@/lib/editable-operational-system-assets.server", () => ({
  getActiveOperationalSystemDeliverySnapshot:
    mocks.getActiveDeliverySnapshot,
  hasEditableOperationalSystemAsset:
    mocks.hasEditableOperationalSystemAsset,
}));

vi.mock("@/lib/enterprise-annuaire", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/enterprise-annuaire")>()),
  enterpriseToSystem: (enterprise: { name: string }) => ({
    name: enterprise.name,
  }),
}));

vi.mock("@/lib/enterprise-annuaire-server", () => ({
  getEnterpriseBySlug: mocks.getEnterpriseBySlug,
}));

vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: vi.fn().mockReturnValue({ conversion: {} }),
}));

vi.mock("@/lib/lead-context", () => ({
  resolveLeadContext: mocks.resolveLeadContext,
}));

vi.mock("@/lib/lead-notifications", () => ({
  submitLeadRequest: mocks.submitLeadRequest,
}));

vi.mock("@/lib/lead-storage", () => ({
  getLeadDeliveryState: mocks.getLeadDeliveryState,
  updateLeadDeliveryStatus: mocks.updateLeadDeliveryStatus,
}));

vi.mock("@/lib/operational-log", () => ({
  logOperationalError: vi.fn(),
}));

vi.mock("@/lib/operational-system-delivery-email.server", () => ({
  sendOperationalSystemDeliveryEmail: mocks.sendDeliveryEmail,
}));

vi.mock("@/lib/levier-asset.server", () => ({
  getLevierAssetSnapshot: mocks.getLevierAssetSnapshot,
}));

vi.mock("@/lib/solution-registry.server", () => ({
  getPublishedSolutionPlacementsForSystem:
    mocks.getPublishedSolutionPlacements,
}));

vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: vi.fn().mockReturnValue(null),
  enforceSameOrigin: vi.fn().mockReturnValue(null),
}));

import { POST } from "@/app/api/systeme-kit/request/route";

function buildRequest(
  overrides: Record<string, unknown> = {},
) {
  return new Request("https://demaa.fr/api/systeme-kit/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.fr",
    },
    body: JSON.stringify({
      attribution: { version: 1 },
      email: "MAYA@EXAMPLE.COM ",
      firstName: " Maya ",
      idempotencyKey: "web:test:12345678",
      marketingConsent: false,
      systemSlug: "plomberie-chauffage",
      website: "",
      ...overrides,
    }),
  });
}

describe("free operational system delivery route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getEnterpriseBySlug.mockResolvedValue({
      name: "Plomberie & chauffage",
      slug: "plomberie-chauffage",
    });
    mocks.getLeadDeliveryState.mockResolvedValue(null);
    mocks.getLevierAssetSnapshot.mockReturnValue({
      assetRevision: "levier-google-sheet-v1-test",
      resourceId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890",
      workbookVersion: "1.0.0",
    });
    mocks.getPublishedSolutionPlacements.mockReturnValue([]);
    mocks.getActiveDeliverySnapshot.mockReturnValue({
      assetRevision: "d032-v1-2026-07-28",
      workbookVersion: "1.0.0",
    });
    mocks.hasEditableOperationalSystemAsset.mockReturnValue(true);
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Livraison du système opérationnel gratuit",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });
    mocks.sendDeliveryEmail.mockResolvedValue({
      sent: true,
      reason: null,
    });
    mocks.submitLeadRequest.mockResolvedValue({
      assetSnapshot: {
        assetRevision: "d032-v1-2026-07-28",
        workbookVersion: "1.0.0",
      },
      duplicate: false,
      leadId: "lead-123",
    });
    mocks.updateLeadDeliveryStatus.mockResolvedValue(undefined);
  });

  it("returns only a generic success and resolves delivery server-side", async () => {
    const response = await POST(buildRequest());
    const rawPayload = await response.text();

    expect(response.status).toBe(200);
    expect(JSON.parse(rawPayload)).toEqual({ ok: true });
    expect(rawPayload).not.toContain("/copy");
    expect(rawPayload).not.toContain("lead-123");
    expect(mocks.sendDeliveryEmail).toHaveBeenCalledWith({
      assetSnapshot: {
        assetRevision: "d032-v1-2026-07-28",
        workbookVersion: "1.0.0",
      },
      deliveryId: "lead-lead-123-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });
    expect(mocks.updateLeadDeliveryStatus).toHaveBeenCalledWith({
      channel: "kit_email",
      leadId: "lead-123",
      status: "sent",
    });
  });

  it("persists and delivers the same immutable asset revision", async () => {
    await POST(buildRequest());

    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "d032-v1-2026-07-28",
          workbookVersion: "1.0.0",
        },
      }),
    );
    expect(mocks.sendDeliveryEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "d032-v1-2026-07-28",
          workbookVersion: "1.0.0",
        },
      }),
    );
  });

  it("uses the universal Levier snapshot only for an explicit published placement", async () => {
    mocks.getPublishedSolutionPlacements.mockReturnValueOnce([{
      resource: {
        resourceSlug: "levier",
        interaction: { interactionMode: "system_delivery" },
      },
    }]);
    mocks.submitLeadRequest.mockResolvedValueOnce({
      assetSnapshot: {
        assetRevision: "levier-google-sheet-v1-test",
        resourceId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890",
        workbookVersion: "1.0.0",
      },
      duplicate: false,
      leadId: "lead-levier",
    });

    const response = await POST(buildRequest({ firstName: undefined }));
    const rawPayload = await response.text();

    expect(response.status).toBe(200);
    expect(JSON.parse(rawPayload)).toEqual({ ok: true });
    expect(rawPayload).not.toMatch(/\/copy|docs\.google|resourceId|1AbCd/);
    expect(mocks.hasEditableOperationalSystemAsset).not.toHaveBeenCalled();
    expect(mocks.getActiveDeliverySnapshot).not.toHaveBeenCalled();
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "levier-google-sheet-v1-test",
          resourceId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890",
          workbookVersion: "1.0.0",
        },
        contact: { email: "maya@example.com", firstName: null },
        title: "Livraison du tableau de pilotage opérationnel - Plomberie & chauffage",
      }),
    );
    expect(mocks.sendDeliveryEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "levier-google-sheet-v1-test",
          resourceId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890",
          workbookVersion: "1.0.0",
        },
        deliveryId: "lead-lead-levier-system",
        firstName: null,
      }),
    );
  });

  it("delivers a catalog resource without exposing its destination", async () => {
    const assetSnapshot = {
      assetRevision: "crm-suivi-commercial-airtable-v1-2026-08-05",
      resourceId: "crm-suivi-commercial",
      workbookVersion: "1.0.0",
    };
    mocks.submitLeadRequest.mockResolvedValueOnce({
      assetSnapshot,
      duplicate: false,
      leadId: "lead-crm",
    });

    const response = await POST(buildRequest({
      firstName: undefined,
      marketingConsent: true,
      resourceSlug: "crm-suivi-commercial",
    }));
    const rawPayload = await response.text();

    expect(response.status).toBe(200);
    expect(JSON.parse(rawPayload)).toEqual({ ok: true });
    expect(rawPayload).not.toMatch(/airtable|resourceId|destination/i);
    expect(mocks.hasEditableOperationalSystemAsset).not.toHaveBeenCalled();
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      assetSnapshot,
      contact: { email: "maya@example.com", firstName: null },
      fields: [{ label: "Ressource", value: "CRM - suivi commercial" }],
      marketingConsent: expect.objectContaining({ granted: true }),
      title: "Livraison de ressource - CRM - suivi commercial - Plomberie & chauffage",
    }));
    expect(mocks.sendDeliveryEmail).toHaveBeenCalledWith(expect.objectContaining({
      assetSnapshot,
      deliveryId: "lead-lead-crm-system",
      firstName: null,
    }));
  });

  it("rejects an unknown catalog resource", async () => {
    const response = await POST(buildRequest({
      resourceSlug: "ressource-inconnue",
    }));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "La ressource demandée est introuvable.",
    });
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("fails closed when the private Levier Google Sheets config is missing", async () => {
    mocks.getPublishedSolutionPlacements.mockReturnValueOnce([{
      resource: {
        resourceSlug: "levier",
        interaction: { interactionMode: "system_delivery" },
      },
    }]);
    mocks.getLevierAssetSnapshot.mockReturnValueOnce(null);

    const response = await POST(buildRequest({ firstName: undefined }));

    expect(response.status).toBe(503);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
  });

  it("keeps marketing consent optional and separate from delivery", async () => {
    await POST(buildRequest());

    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: {
          email: false,
          resend: false,
          slack: true,
        },
        marketingConsent: expect.objectContaining({
          granted: false,
          version: "system-delivery-v1",
        }),
      }),
    );

    await POST(buildRequest({ marketingConsent: true }));

    expect(mocks.submitLeadRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        channels: expect.objectContaining({ resend: true }),
        marketingConsent: expect.objectContaining({ granted: true }),
      }),
    );
  });

  it("accepts sectorSlug temporarily for backward compatibility", async () => {
    await POST(buildRequest({
      sectorSlug: "plomberie-chauffage",
      systemSlug: undefined,
    }));

    expect(mocks.hasEditableOperationalSystemAsset).toHaveBeenCalledWith(
      "plomberie-chauffage",
    );
  });

  it("does not send again when the idempotent delivery is already complete", async () => {
    mocks.getLeadDeliveryState.mockResolvedValueOnce("sent");

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
  });

  it("keeps the historical revision for an idempotent duplicate after the active revision changes", async () => {
    mocks.getActiveDeliverySnapshot.mockReturnValueOnce({
      assetRevision: "d061-v2-pilot-2026-07-29-01",
      workbookVersion: "2.0.0-pilot",
    });
    mocks.submitLeadRequest.mockResolvedValueOnce({
      assetSnapshot: {
        assetRevision: "d032-v1-2026-07-28",
        workbookVersion: "1.0.0",
      },
      duplicate: true,
      leadId: "lead-historique",
    });

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "d061-v2-pilot-2026-07-29-01",
          workbookVersion: "2.0.0-pilot",
        },
      }),
    );
    expect(mocks.sendDeliveryEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "d032-v1-2026-07-28",
          workbookVersion: "1.0.0",
        },
        deliveryId: "lead-lead-historique-system",
      }),
    );
  });

  it("does not resend a completed historical duplicate after the active revision changes", async () => {
    mocks.getActiveDeliverySnapshot.mockReturnValueOnce({
      assetRevision: "d061-v2-pilot-2026-07-29-01",
      workbookVersion: "2.0.0-pilot",
    });
    mocks.submitLeadRequest.mockResolvedValueOnce({
      assetSnapshot: {
        assetRevision: "d032-v1-2026-07-28",
        workbookVersion: "1.0.0",
      },
      duplicate: true,
      leadId: "lead-historique",
    });
    mocks.getLeadDeliveryState.mockResolvedValueOnce("sent");

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
  });

  it("delivers the explicit v1 revision for a pre-D061 duplicate", async () => {
    mocks.submitLeadRequest.mockResolvedValueOnce({
      assetSnapshot: {
        assetRevision: "d032-v1-2026-07-28",
        workbookVersion: "1.0.0",
      },
      duplicate: true,
      leadId: "lead-sans-revision",
    });

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(mocks.sendDeliveryEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        assetSnapshot: {
          assetRevision: "d032-v1-2026-07-28",
          workbookVersion: "1.0.0",
        },
        deliveryId: "lead-lead-sans-revision-system",
      }),
    );
  });

  it("silently absorbs honeypot submissions", async () => {
    const response = await POST(buildRequest({ website: "bot.example" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
  });

  it("rejects invalid contact data before storing or sending", async () => {
    const response = await POST(buildRequest({
      firstName: "",
    }));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
  });

  it("keeps first name mandatory for the historical system delivery", async () => {
    const response = await POST(buildRequest({ firstName: undefined }));

    expect(response.status).toBe(400);
    expect(mocks.getPublishedSolutionPlacements).toHaveBeenCalledWith(
      "plomberie-chauffage",
    );
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
  });

  it("rejects an invalid e-mail even when Levier does not require a name", async () => {
    const response = await POST(buildRequest({
      email: "invalid",
      firstName: undefined,
    }));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
  });

  it("does not disclose or deliver an unknown editable asset", async () => {
    mocks.hasEditableOperationalSystemAsset.mockReturnValueOnce(false);

    const response = await POST(buildRequest({
      systemSlug: "systeme-inconnu",
    }));

    expect(response.status).toBe(404);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
  });

  it("records a failed delivery for the retry cron", async () => {
    mocks.sendDeliveryEmail.mockResolvedValueOnce({
      sent: false,
      reason: "resend_error",
    });

    const response = await POST(buildRequest());

    expect(response.status).toBe(502);
    expect(mocks.updateLeadDeliveryStatus).toHaveBeenCalledWith({
      channel: "kit_email",
      error: "resend_error",
      leadId: "lead-123",
      status: "failed",
    });
  });
});
