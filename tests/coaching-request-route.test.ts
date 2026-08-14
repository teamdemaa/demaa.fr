import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceSameOrigin: vi.fn(),
  enforceServiceRequestRateLimit: vi.fn(),
  requireCurrentCustomerEmail: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  appendCustomerCoachingMessage: vi.fn(),
  claimPendingCoachingMessageDraft: vi.fn(),
  getCustomerCoachingMessages: vi.fn(),
  markCoachingMessageDraftSent: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  normalizeIdempotencyKey: (value: unknown) =>
    typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, maxLength: number) =>
    typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({
    data: await request.json() as T,
    response: null,
  }),
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  requireCurrentCustomerEmail: mocks.requireCurrentCustomerEmail,
}));
vi.mock("@/lib/coaching-conversation.server", () => ({
  appendCustomerCoachingMessage: mocks.appendCustomerCoachingMessage,
  getCustomerCoachingMessages: mocks.getCustomerCoachingMessages,
}));
vi.mock("@/lib/coaching-message-draft.server", () => ({
  claimPendingCoachingMessageDraft: mocks.claimPendingCoachingMessageDraft,
  markCoachingMessageDraftSent: mocks.markCoachingMessageDraftSent,
}));
vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: mocks.resolveLeadAttribution,
}));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn() }));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));
vi.mock("@/lib/service-request-security.server", () => ({
  enforceServiceRequestRateLimit: mocks.enforceServiceRequestRateLimit,
}));

import { GET, POST } from "@/app/api/coaching-request/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.co/api/coaching-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
      Referer: "https://demaa.co/",
    },
    body: JSON.stringify({
      attribution: {},
      email: "spoofed@example.net",
      idempotencyKey: "coaching:12345678",
      message: "Je souhaite clarifier ma prochaine décision opérationnelle.",
      requestKind: "message",
      website: "",
      ...overrides,
    }),
  });
}

describe("coaching request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceServiceRequestRateLimit.mockResolvedValue(null);
    mocks.requireCurrentCustomerEmail.mockResolvedValue({
      email: "owner@example.com",
      response: null,
    });
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Coaching - Messages",
      sourceUrl: "https://demaa.co/",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "lead-1" });
    mocks.appendCustomerCoachingMessage.mockResolvedValue({
      created: true,
      message: {
        author: "customer",
        body: "Je souhaite clarifier ma prochaine décision opérationnelle.",
        createdAt: "2026-08-11T08:00:00.000Z",
        id: "message-1",
      },
    });
    mocks.getCustomerCoachingMessages.mockResolvedValue([]);
    mocks.claimPendingCoachingMessageDraft.mockResolvedValue(null);
    mocks.markCoachingMessageDraftSent.mockResolvedValue(true);
  });

  it("uses the authenticated session email and ignores a body email", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      contact: expect.objectContaining({ email: "owner@example.com" }),
      requestType: "coaching_message",
    }));
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledWith({
      body: "Je souhaite clarifier ma prochaine décision opérationnelle.",
      email: "owner@example.com",
      idempotencyKey: "coaching:12345678",
    });
  });

  it("refuses a coaching request without an authenticated session", async () => {
    mocks.requireCurrentCustomerEmail.mockResolvedValue({
      email: null,
      response: Response.json({ error: "authentication_required" }, { status: 401 }),
    });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("claims a server draft and ignores client-controlled message and idempotency", async () => {
    mocks.claimPendingCoachingMessageDraft.mockResolvedValue({
      alreadySent: false,
      body: "Message conservé avant la connexion.",
      idempotencyKey: "coaching:draft:server-owned-key",
    });

    const response = await POST(request({
      draftToken: "a".repeat(43),
      idempotencyKey: "coaching:forged-client-key",
      message: "Message forgé côté client.",
    }));

    expect(response.status).toBe(202);
    expect(mocks.claimPendingCoachingMessageDraft).toHaveBeenCalledWith({
      draftToken: "a".repeat(43),
      email: "owner@example.com",
    });
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledWith({
      body: "Message conservé avant la connexion.",
      email: "owner@example.com",
      idempotencyKey: "coaching:draft:server-owned-key",
    });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: [{ label: "Message", value: "Message conservé avant la connexion." }],
      idempotencyKey: "coaching:draft:server-owned-key",
    }));
    expect(mocks.markCoachingMessageDraftSent).toHaveBeenCalledWith({
      draftToken: "a".repeat(43),
      email: "owner@example.com",
    });
  });

  it("rejects an unavailable draft without accepting the client fallback", async () => {
    const response = await POST(request({
      draftToken: "a".repeat(43),
      message: "Ce texte ne doit pas contourner le claim.",
    }));

    expect(response.status).toBe(409);
    expect(mocks.appendCustomerCoachingMessage).not.toHaveBeenCalled();
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("accepts a sent-draft retry with the same server idempotency key", async () => {
    mocks.claimPendingCoachingMessageDraft.mockResolvedValue({
      alreadySent: true,
      body: "Message déjà accepté lors du premier essai.",
      idempotencyKey: "coaching:draft:stable-retry-key",
    });
    mocks.appendCustomerCoachingMessage.mockResolvedValue({
      created: false,
      message: {
        author: "customer",
        body: "Message déjà accepté lors du premier essai.",
        createdAt: "2026-08-11T08:00:00.000Z",
        id: "existing-message",
      },
    });
    mocks.submitLeadRequest.mockResolvedValue({
      duplicate: true,
      leadId: "existing-lead",
    });

    const response = await POST(request({ draftToken: "a".repeat(43) }));

    expect(response.status).toBe(202);
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "coaching:draft:stable-retry-key",
      }),
    );
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "coaching:draft:stable-retry-key",
      }),
    );
    expect(mocks.markCoachingMessageDraftSent).toHaveBeenCalledOnce();
  });

  it("returns the claimed text when delivery fails so the composer can retry", async () => {
    mocks.claimPendingCoachingMessageDraft.mockResolvedValue({
      alreadySent: false,
      body: "Message à conserver après l’échec.",
      idempotencyKey: "coaching:draft:retry-key",
    });
    mocks.submitLeadRequest.mockRejectedValueOnce(new Error("delivery_failed"));

    const response = await POST(request({ draftToken: "a".repeat(43) }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      draftMessage: "Message à conserver après l’échec.",
    });
    expect(mocks.markCoachingMessageDraftSent).not.toHaveBeenCalled();
  });

  it("accepts only the current subscription formulas and records their displayed price", async () => {
    const response = await POST(request({
      company: "Entreprise test",
      message: "",
      offer: "pilotage_2",
      phone: "+33 6 12 34 56 78",
      requestKind: "formula",
    }));

    expect(response.status).toBe(202);
    expect(mocks.requireCurrentCustomerEmail).not.toHaveBeenCalled();
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Formule", value: "Coach business · 2 sessions / mois" },
        { label: "Tarif affiché", value: "550 € HT / mois" },
      ]),
      requestType: "specialist_formula_interest",
    }));
  });

  it("rejects the retired one-off coaching offers", async () => {
    const response = await POST(request({
      company: "Entreprise test",
      message: "",
      offer: "session",
      phone: "+33 6 12 34 56 78",
      requestKind: "formula",
    }));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("rejects inherited object keys as formula identifiers", async () => {
    const response = await POST(request({
      company: "Entreprise test",
      message: "",
      offer: "toString",
      phone: "+33 6 12 34 56 78",
      requestKind: "formula",
    }));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("returns only the authenticated customer's conversation without caching", async () => {
    mocks.getCustomerCoachingMessages.mockResolvedValue([{
      author: "specialist",
      body: "Voici la prochaine étape.",
      createdAt: "2026-08-11T09:00:00.000Z",
      id: "reply-1",
    }]);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.getCustomerCoachingMessages).toHaveBeenCalledWith("owner@example.com");
    expect(payload.messages).toHaveLength(1);
  });
});
