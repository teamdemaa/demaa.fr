import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
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

vi.mock("@/lib/slack", () => ({
  sendSlackMessage,
  SlackMessageError: MockSlackMessageError,
}));

describe("POST /api/system-setup-request", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    sendSlackMessage.mockResolvedValue(undefined);
  });

  it("rejects incomplete requests", async () => {
    const { POST } = await import("@/app/api/system-setup-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/system-setup-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName: "", sector: "", whatsapp: "", availability: "" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Merci de renseigner tous les champs avant l'envoi.",
    });
  });

  it("returns the Slack status code on notification failures", async () => {
    sendSlackMessage.mockRejectedValue(new MockSlackMessageError("slack", 502));
    const { POST } = await import("@/app/api/system-setup-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/system-setup-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          sector: "BTP",
          whatsapp: "+33600000000",
          availability: "Demain matin",
        }),
      })
    );

    expect(response.status).toBe(502);
  });

  it("sends valid system setup requests", async () => {
    const { POST } = await import("@/app/api/system-setup-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/system-setup-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          sector: "BTP",
          whatsapp: "+33600000000",
          availability: "Demain matin",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendSlackMessage).toHaveBeenCalled();
  });
});
