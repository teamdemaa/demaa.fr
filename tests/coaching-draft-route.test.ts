import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createPendingCoachingMessageDraft: vi.fn(),
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
}));

vi.mock("@/lib/coaching-message-draft.server", () => ({
  createPendingCoachingMessageDraft: mocks.createPendingCoachingMessageDraft,
}));
vi.mock("@/lib/api-security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-security")>();
  return { ...actual, enforceRateLimit: mocks.enforceRateLimit };
});
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { POST } from "@/app/api/coaching-draft/route";

function request(body: Record<string, unknown>) {
  return new Request("https://demaa.co/api/coaching-draft", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
    },
    method: "POST",
  });
}

describe("coaching draft creation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.createPendingCoachingMessageDraft.mockResolvedValue({
      draftToken: "a".repeat(43),
      expiresAt: "2026-08-13T11:00:00.000Z",
    });
  });

  it("creates a no-store draft without sending or requiring an identity", async () => {
    const response = await POST(request({
      message: "  Je souhaite clarifier ma prochaine décision.  ",
    }));

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0",
    );
    await expect(response.json()).resolves.toEqual({
      draftToken: "a".repeat(43),
      expiresAt: "2026-08-13T11:00:00.000Z",
    });
    expect(mocks.createPendingCoachingMessageDraft).toHaveBeenCalledWith({
      body: "Je souhaite clarifier ma prochaine décision.",
    });
  });

  it("rejects an empty message before creating a draft", async () => {
    const response = await POST(request({ message: " x " }));

    expect(response.status).toBe(400);
    expect(mocks.createPendingCoachingMessageDraft).not.toHaveBeenCalled();
  });

  it("enforces host and same-origin guards", async () => {
    mocks.enforceAllowedHost.mockReturnValueOnce(
      Response.json({ error: "host" }, { status: 403 }),
    );
    const blockedHost = await POST(request({ message: "Message valide" }));
    expect(blockedHost.status).toBe(403);
    expect(mocks.enforceSameOrigin).not.toHaveBeenCalled();

    mocks.enforceSameOrigin.mockReturnValueOnce(
      Response.json({ error: "origin" }, { status: 403 }),
    );
    const blockedOrigin = await POST(request({ message: "Message valide" }));
    expect(blockedOrigin.status).toBe(403);
    expect(mocks.createPendingCoachingMessageDraft).not.toHaveBeenCalled();
  });

  it("stops at the rate limiter", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce(
      Response.json({ error: "limited" }, { status: 429 }),
    );
    const response = await POST(request({ message: "Message valide" }));

    expect(response.status).toBe(429);
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
      expect.any(Request),
      {
        keyPrefix: "coaching-message-draft",
        limit: 8,
        windowMs: 10 * 60 * 1000,
      },
    );
    expect(mocks.createPendingCoachingMessageDraft).not.toHaveBeenCalled();
  });
});
