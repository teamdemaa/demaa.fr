import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  appendSpecialistCoachingMessage: vi.fn(),
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  getCoachingConversationForAdmin: vi.fn(),
  getCoachingConversationSummaries: vi.fn(),
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
}));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn() }));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { GET, POST } from "@/app/api/admin/coaching/route";

const secret = "a-secure-coaching-admin-secret";
const conversationId = "a".repeat(64);

function request(path = "", init: RequestInit = {}) {
  return new Request(`https://demaa.co/api/admin/coaching${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
      "x-demaa-admin-secret": secret,
      ...init.headers,
    },
  });
}

describe("coaching admin route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.COACHING_ADMIN_SECRET = secret;
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getCoachingConversationSummaries.mockResolvedValue([]);
    mocks.getCoachingConversationForAdmin.mockResolvedValue({
      customerEmail: "owner@example.com",
      id: conversationId,
      messages: [],
    });
    mocks.appendSpecialistCoachingMessage.mockResolvedValue({
      created: true,
      message: {
        author: "specialist",
        body: "Voici ma réponse.",
        createdAt: "2026-08-11T09:00:00.000Z",
        id: "reply-1",
      },
    });
  });

  afterEach(() => delete process.env.COACHING_ADMIN_SECRET);

  it("refuses access without the private admin secret", async () => {
    const response = await GET(request("", {
      headers: { "x-demaa-admin-secret": "wrong-secret" },
    }));
    expect(response.status).toBe(401);
  });

  it("returns private conversation history and never caches it", async () => {
    const response = await GET(request(`?conversationId=${conversationId}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.getCoachingConversationForAdmin).toHaveBeenCalledWith(conversationId);
  });

  it("allows a specialist to append a reply after origin and secret checks", async () => {
    const response = await POST(request("", {
      method: "POST",
      body: JSON.stringify({ conversationId, message: "Voici ma réponse." }),
    }));
    expect(response.status).toBe(201);
    expect(mocks.enforceSameOrigin).toHaveBeenCalled();
    expect(mocks.appendSpecialistCoachingMessage).toHaveBeenCalledWith({
      body: "Voici ma réponse.",
      conversationId,
    });
  });
});
