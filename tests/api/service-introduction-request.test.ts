import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const getDemaaServiceBySlug = vi.fn();
const sendSlackMessage = vi.fn();

class MockSlackMessageError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");
  return { ...actual, enforceRateLimit };
});

vi.mock("@/lib/service-catalog", () => ({
  getDemaaServiceBySlug,
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage,
  SlackMessageError: MockSlackMessageError,
}));

describe("POST /api/service-introduction-request", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    getDemaaServiceBySlug.mockReturnValue({
      name: "Site web",
    });
    sendSlackMessage.mockResolvedValue(undefined);
  });

  it("rejects incomplete requests", async () => {
    const { POST } = await import("@/app/api/service-introduction-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/service-introduction-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "", phone: "", serviceSlug: "" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Merci d'indiquer votre nom, votre téléphone et le service demandé.",
    });
  });

  it("returns the Slack error status when notification fails", async () => {
    sendSlackMessage.mockRejectedValue(new MockSlackMessageError("slack", 502));
    const { POST } = await import("@/app/api/service-introduction-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/service-introduction-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Jean",
          phone: "+33600000000",
          serviceSlug: "site-web",
        }),
      })
    );

    expect(response.status).toBe(502);
  });

  it("sends valid requests to Slack", async () => {
    const { POST } = await import("@/app/api/service-introduction-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/service-introduction-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Jean",
          phone: "+33600000000",
          email: "jean@demaa.fr",
          company: "Demaa",
          details: "Besoin d'un site",
          serviceSlug: "site-web",
          source: "modal",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendSlackMessage).toHaveBeenCalled();
  });
});
