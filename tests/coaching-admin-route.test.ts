import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  appendSpecialistCoachingMessage: vi.fn(),
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  getCoachingConversationForAdmin: vi.fn(),
  getCoachingConversationSummaries: vi.fn(),
  getCurrentAdminIdentity: vi.fn(),
  getMonthlyAccompanimentBenefitForUid: vi.fn(),
  reopenFreeCoachingClarification: vi.fn(),
  setExpertAccountantBenefitForUid: vi.fn(),
}));

vi.mock("@/lib/admin-auth.server", () => ({
  getCurrentAdminIdentity: mocks.getCurrentAdminIdentity,
}));
vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeText: (value: unknown, maxLength: number, options: { multiline?: boolean } = {}) => {
    if (typeof value !== "string") return "";
    return (options.multiline ? value.trim() : value.replace(/\s+/g, " ").trim()).slice(0, maxLength);
  },
  readJsonBody: async <T,>(request: Request) => ({ data: await request.json() as T, response: null }),
}));
vi.mock("@/lib/coaching-conversation.server", () => ({
  appendSpecialistCoachingMessage: mocks.appendSpecialistCoachingMessage,
  getCoachingConversationForAdmin: mocks.getCoachingConversationForAdmin,
  getCoachingConversationSummaries: mocks.getCoachingConversationSummaries,
  reopenFreeCoachingClarification: mocks.reopenFreeCoachingClarification,
}));
vi.mock("@/lib/monthly-accompaniment-benefit.server", () => ({
  getMonthlyAccompanimentBenefitForUid: mocks.getMonthlyAccompanimentBenefitForUid,
  setExpertAccountantBenefitForUid: mocks.setExpertAccountantBenefitForUid,
}));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn(), logOperationalEvent: vi.fn() }));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { GET, POST } from "@/app/api/admin/coaching/route";

const conversationId = "a".repeat(64);

function request(path = "", init: RequestInit = {}) {
  return new Request(`https://demaa.co/api/admin/coaching${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
      ...init.headers,
    },
  });
}

describe("coaching admin route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.getCurrentAdminIdentity.mockResolvedValue({
      email: "hi.teamdemaa@gmail.com",
      provider: "google",
      uid: "admin-uid",
    });
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getCoachingConversationSummaries.mockResolvedValue([]);
    mocks.getCoachingConversationForAdmin.mockResolvedValue({
      customerEmail: "owner@example.com",
      freeStatus: "open",
      id: conversationId,
      messages: [],
    });
    mocks.appendSpecialistCoachingMessage.mockResolvedValue({
      created: true,
      freeStatus: "open",
      message: {
        author: "specialist",
        body: "Voici ma réponse.",
        createdAt: "2026-08-11T09:00:00.000Z",
        id: "reply-1",
      },
    });
    mocks.reopenFreeCoachingClarification.mockResolvedValue({
      freeStatus: "open",
      openedAt: "2026-08-15T09:00:00.000Z",
      previousStatus: "completed",
      reopened: true,
    });
    mocks.getMonthlyAccompanimentBenefitForUid.mockResolvedValue({
      active: false,
      source: null,
      validUntil: null,
    });
    mocks.setExpertAccountantBenefitForUid.mockResolvedValue({
      active: true,
      source: "expert_accountant",
      validUntil: "2027-08-14T00:00:00.000Z",
    });
  });

  it("rate limits a bad admin session before refusing access", async () => {
    mocks.getCurrentAdminIdentity.mockResolvedValueOnce(null);
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), {
      keyPrefix: "coaching-admin-read",
      limit: 180,
      windowMs: 60 * 60 * 1000,
    });
    expect(mocks.getCoachingConversationSummaries).not.toHaveBeenCalled();
  });

  it("limits GET requests before reading private conversations", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }));

    const response = await GET(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.getCoachingConversationSummaries).not.toHaveBeenCalled();
  });

  it("limits POST requests before checking the admin session", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }));

    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({ conversationId, message: "Réponse." }),
    }));

    expect(response.status).toBe(429);
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), {
      keyPrefix: "coaching-admin-write",
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });
    expect(mocks.appendSpecialistCoachingMessage).not.toHaveBeenCalled();
  });

  it("returns private conversation history and never caches it", async () => {
    const response = await GET(request(`?conversationId=${conversationId}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.getCoachingConversationForAdmin).toHaveBeenCalledWith(conversationId);
  });

  it("allows a specialist to append a reply after origin and session checks", async () => {
    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({ conversationId, message: "Voici ma réponse." }),
    }));
    expect(response.status).toBe(201);
    expect(mocks.enforceSameOrigin).toHaveBeenCalled();
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), {
      keyPrefix: "coaching-admin-write",
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });
    expect(mocks.appendSpecialistCoachingMessage).toHaveBeenCalledWith({
      body: "Voici ma réponse.",
      completeFreeClarification: false,
      conversationId,
      recommendation: null,
    });
  });

  it("sends the final reply and closes the free clarification atomically", async () => {
    mocks.appendSpecialistCoachingMessage.mockResolvedValueOnce({
      created: true,
      freeStatus: "completed",
      message: { author: "specialist", body: "Réponse finale.", createdAt: "2026-08-11T09:00:00.000Z", id: "reply-2" },
    });
    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({ completeFreeClarification: true, conversationId, message: "Réponse finale." }),
    }));
    expect(response.status).toBe(201);
    expect(mocks.appendSpecialistCoachingMessage).toHaveBeenCalledWith({
      body: "Réponse finale.",
      completeFreeClarification: true,
      conversationId,
      recommendation: null,
    });
    await expect(response.json()).resolves.toMatchObject({ freeStatus: "completed" });
  });

  it("allows the Team to reopen a completed clarification", async () => {
    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({ action: "reopen", conversationId }),
    }));
    expect(response.status).toBe(200);
    expect(mocks.reopenFreeCoachingClarification).toHaveBeenCalledWith(conversationId);
  });

  it("refuses to reopen a clarification that is not completed", async () => {
    mocks.reopenFreeCoachingClarification.mockResolvedValueOnce({
      freeStatus: "open",
      openedAt: "2026-08-15T09:00:00.000Z",
      previousStatus: "open",
      reopened: false,
    });
    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({ action: "reopen", conversationId }),
    }));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Seule une clarification terminée peut être réouverte.",
    });
  });

  it("attaches a validated private recommendation to the same reply", async () => {
    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        message: "Cette prestation correspond à votre situation.",
        recommendationResourceSlug: "assistance-administrative",
      }),
    }));

    expect(response.status).toBe(201);
    expect(mocks.appendSpecialistCoachingMessage).toHaveBeenCalledWith({
      body: "Cette prestation correspond à votre situation.",
      completeFreeClarification: false,
      conversationId,
      recommendation: {
        needKey: null,
        resourceSlug: "assistance-administrative",
        systemSlug: null,
      },
    });
  });

  it("rejects a recommendation with an invalid need", async () => {
    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        message: "Réponse.",
        recommendationNeedKey: "autre",
        recommendationResourceSlug: "assistance-administrative",
      }),
    }));
    expect(response.status).toBe(400);
    expect(mocks.appendSpecialistCoachingMessage).not.toHaveBeenCalled();
  });

  it("lets the Team activate the expert-accountant benefit for the conversation owner", async () => {
    mocks.getCoachingConversationForAdmin.mockResolvedValueOnce({
      customerEmail: "owner@example.com",
      freeStatus: "open",
      id: conversationId,
      messages: [],
      ownerUid: "owner-uid",
      recommendations: [],
    });
    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({
        action: "benefit",
        benefitActive: true,
        conversationId,
      }),
    }));
    expect(response.status).toBe(200);
    expect(mocks.setExpertAccountantBenefitForUid).toHaveBeenCalledWith({
      active: true,
      uid: "owner-uid",
    });
  });
});
