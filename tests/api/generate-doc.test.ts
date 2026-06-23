import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const streamMock = vi.fn();
const anthropicConstructor = vi.fn();

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");
  return { ...actual, enforceRateLimit };
});

vi.mock("@anthropic-ai/sdk", () => {
  class MockAnthropic {
    messages = {
      stream: streamMock,
    };

    constructor(...args: unknown[]) {
      anthropicConstructor(...args);
    }
  }

  return {
    default: MockAnthropic,
  };
});

describe("POST /api/generate-doc", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    streamMock.mockReset();
    anthropicConstructor.mockReset();
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
  });

  it("rejects invalid message payloads", async () => {
    const { POST } = await import("@/app/api/generate-doc/route");
    const response = await POST(
      new Request("https://demaa.fr/api/generate-doc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: "" }],
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid messages format",
    });
  });

  it("returns 401 when the Anthropic API key is missing", async () => {
    process.env.ANTHROPIC_API_KEY = "";
    const { POST } = await import("@/app/api/generate-doc/route");
    const response = await POST(
      new Request("https://demaa.fr/api/generate-doc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Rédige un contrat." }],
        }),
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Clé API Anthropic manquante",
    });
  });

  it("streams a response when the request is valid", async () => {
    streamMock.mockReturnValue({
      toReadableStream: () =>
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("---DOCUMENT---\nContrat test"));
            controller.close();
          },
        }),
    });

    const { POST } = await import("@/app/api/generate-doc/route");
    const response = await POST(
      new Request("https://demaa.fr/api/generate-doc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Rédige un contrat." }],
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(anthropicConstructor).toHaveBeenCalledWith({ apiKey: "test-anthropic-key" });
    expect(streamMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{ role: "user", content: "Rédige un contrat." }],
      })
    );

    const body = await response.text();
    expect(body).toContain("---DOCUMENT---");
  });
});
