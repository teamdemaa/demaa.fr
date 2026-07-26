import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getEnterpriseBySlug: vi.fn(),
  getLeadDeliveryState: vi.fn(),
  getPilotingSheetCopyUrl: vi.fn(),
  resolveLeadContext: vi.fn(),
  scheduleSystemKitSequence: vi.fn(),
  sendSystemKitEmail: vi.fn(),
  submitLeadRequest: vi.fn(),
  updateLeadDeliveryStatus: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
  normalizeIdempotencyKey: (value: unknown) =>
    typeof value === "string" ? value : "",
  normalizeText: (value: unknown, maxLength: number) =>
    typeof value === "string" ? value.trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({
    data: (await request.json()) as T,
    response: null,
  }),
}));

vi.mock("@/lib/document-models", () => ({
  getPilotingSheetCopyUrl: mocks.getPilotingSheetCopyUrl,
}));

vi.mock("@/lib/enterprise-annuaire", () => ({
  enterpriseToSystem: (enterprise: { name: string }) => ({
    name: enterprise.name,
  }),
}));

vi.mock("@/lib/enterprise-annuaire-server", () => ({
  getEnterpriseBySlug: mocks.getEnterpriseBySlug,
}));

vi.mock("@/lib/generations-db", () => ({
  scheduleSystemKitSequence: mocks.scheduleSystemKitSequence,
}));

vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: vi.fn().mockReturnValue({ source: "test" }),
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

vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: vi.fn().mockReturnValue(null),
  enforceSameOrigin: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/system-kit-email", () => ({
  getSystemKitEmailErrorMessage: vi
    .fn()
    .mockReturnValue("Impossible d’envoyer le modèle."),
  sendSystemKitEmail: mocks.sendSystemKitEmail,
}));

vi.mock("@/lib/operational-log", () => ({
  logOperationalError: vi.fn(),
}));

import { POST } from "@/app/api/systeme-kit/request/route";

describe("blank operational system request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getEnterpriseBySlug.mockResolvedValue({
      name: "Plomberie & chauffage",
      slug: "plomberie-chauffage",
    });
    mocks.getPilotingSheetCopyUrl.mockReturnValue(
      "https://docs.google.com/spreadsheets/d/blank-model/copy",
    );
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Réception du modèle vierge du système opérationnel",
    });
    mocks.submitLeadRequest.mockResolvedValue({ leadId: "lead-123" });
    mocks.getLeadDeliveryState.mockResolvedValue(null);
    mocks.sendSystemKitEmail.mockResolvedValue({
      sent: true,
      reason: null,
    });
    mocks.updateLeadDeliveryStatus.mockResolvedValue(undefined);
    mocks.scheduleSystemKitSequence.mockResolvedValue(undefined);
  });

  it("collecte prénom et email puis renvoie uniquement la copie du modèle vierge", async () => {
    const request = new Request(
      "https://demaa.fr/api/systeme-kit/request",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "maya@example.com",
          firstName: "Maya",
          idempotencyKey: "web:test:12345678",
          sectorName: "Plomberie & chauffage",
          sectorSlug: "plomberie-chauffage",
          website: "",
        }),
      },
    );

    const response = await POST(request);
    const payload = (await response.json()) as {
      copyUrl?: string;
      leadId?: string;
      ok?: boolean;
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      copyUrl:
        "https://docs.google.com/spreadsheets/d/blank-model/copy",
      leadId: "lead-123",
      ok: true,
    });
    expect(mocks.sendSystemKitEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "maya@example.com",
        firstName: "Maya",
        systemSlug: "plomberie-chauffage",
      }),
    );
    expect(mocks.scheduleSystemKitSequence).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "maya@example.com",
        leadId: "lead-123",
        systemSlug: "plomberie-chauffage",
      }),
    );
  });

  it("refuse une demande sans prénom ou sans email", async () => {
    const response = await POST(
      new Request("https://demaa.fr/api/systeme-kit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "",
          firstName: "",
          sectorSlug: "plomberie-chauffage",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
    expect(mocks.sendSystemKitEmail).not.toHaveBeenCalled();
  });
});
