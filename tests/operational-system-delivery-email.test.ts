import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getCopyUrl: vi.fn(),
}));

vi.mock("@/lib/editable-operational-system-assets.server", () => ({
  getEditableOperationalSystemCopyUrl: mocks.getCopyUrl,
}));

import { sendOperationalSystemDeliveryEmail } from "@/lib/operational-system-delivery-email.server";

describe("operational system delivery email", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RESEND_FROM_EMAIL", "Demaa <systemes@demaa.fr>");
    mocks.getCopyUrl.mockReturnValue(
      "https://docs.google.com/spreadsheets/d/editable-file/copy",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends the private copy link only inside the transactional email", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), { status: 200 }),
    );

    const result = await sendOperationalSystemDeliveryEmail({
      deliveryId: "lead-123-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });

    expect(result).toEqual({ sent: true, reason: null });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    const payload = JSON.parse(String(init?.body)) as {
      html: string;
      subject: string;
      text: string;
    };

    expect(headers["Idempotency-Key"]).toMatch(/^demaa-system-[a-f0-9]{64}$/);
    expect(payload.subject).toBe(
      "Votre copie modifiable — Plomberie & chauffage",
    );
    expect(payload.html).toContain("Créer ma copie dans Google Drive");
    expect(payload.html).toContain("/copy");
    expect(payload.text).toContain("/copy");
  });

  it("does not call Resend when the editable asset is missing", async () => {
    mocks.getCopyUrl.mockReturnValueOnce(null);
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await sendOperationalSystemDeliveryEmail({
      deliveryId: "lead-123-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Système inconnu",
      systemSlug: "systeme-inconnu",
    });

    expect(result).toEqual({ sent: false, reason: "missing_asset" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
