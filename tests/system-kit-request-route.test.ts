import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: vi.fn().mockReturnValue(null),
  enforceSameOrigin: vi.fn().mockReturnValue(null),
}));

import { POST } from "@/app/api/systeme-kit/request/route";

describe("legacy free operational system request route", () => {
  it("never distributes an operational system for free", async () => {
    const response = await POST(
      new Request("https://demaa.fr/api/systeme-kit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "maya@example.com",
          firstName: "Maya",
          sectorSlug: "plomberie-chauffage",
        }),
      }),
    );
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(410);
    expect(payload.error).toContain("livraison gratuite a été arrêtée");
    expect(payload.error).toContain("tableau prêt à utiliser");
  });
});
