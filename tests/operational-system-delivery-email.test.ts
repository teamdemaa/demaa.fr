import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getCopyUrl: vi.fn(),
  readLevierAttachment: vi.fn(),
}));

vi.mock("@/lib/editable-operational-system-assets.server", () => ({
  getEditableOperationalSystemCopyUrl: mocks.getCopyUrl,
}));

vi.mock("@/lib/levier-asset.server", () => ({
  LEVIER_ASSET_REVISION: "levier-v1-test",
  LEVIER_ATTACHMENT_FILENAME: "Levier.xlsx",
  readLevierAttachment: mocks.readLevierAttachment,
}));

import { sendOperationalSystemDeliveryEmail } from "@/lib/operational-system-delivery-email.server";

describe("operational system delivery email", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RESEND_FROM_EMAIL", "Demaa <systemes@demaa.fr>");
    mocks.getCopyUrl.mockReturnValue(
      "https://example.invalid/private-copy",
    );
    mocks.readLevierAttachment.mockResolvedValue(
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
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
      assetRevision: "d032-v1-2026-07-28",
      deliveryId: "lead-123-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });

    expect(result).toEqual({ sent: true, reason: null });
    expect(mocks.getCopyUrl).toHaveBeenCalledWith(
      "plomberie-chauffage",
      "d032-v1-2026-07-28",
    );
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
      "Votre copie modifiable - Plomberie & chauffage",
    );
    expect(payload.html).toContain("Créer ma copie dans Google Drive");
    expect(payload.html).toContain("https://example.invalid/private-copy");
    expect(payload.text).toContain("https://example.invalid/private-copy");
  });

  it("does not call Resend when the editable asset is missing", async () => {
    mocks.getCopyUrl.mockReturnValueOnce(null);
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await sendOperationalSystemDeliveryEmail({
      assetRevision: "d032-v1-2026-07-28",
      deliveryId: "lead-123-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Système inconnu",
      systemSlug: "systeme-inconnu",
    });

    expect(result).toEqual({ sent: false, reason: "missing_asset" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("attaches Levier.xlsx without exposing a URL or using the legacy registry", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "email_levier" }), { status: 200 }),
    );

    const result = await sendOperationalSystemDeliveryEmail({
      assetRevision: "levier-v1-test",
      deliveryId: "lead-levier-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });

    expect(result).toEqual({ sent: true, reason: null });
    expect(mocks.getCopyUrl).not.toHaveBeenCalled();
    expect(mocks.readLevierAttachment).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(init?.body)) as {
      attachments: Array<{ content: string; filename: string }>;
      html: string;
      subject: string;
      text: string;
    };
    expect(payload.attachments).toEqual([{
      content: "UEsDBA==",
      filename: "Levier.xlsx",
    }]);
    expect(payload.subject).toBe("Votre tableau de pilotage Levier");
    expect(`${payload.html}${payload.text}`).not.toMatch(/https?:\/\/|Google Drive/);
  });

  it("fails closed before calling Resend when Levier.xlsx is missing", async () => {
    mocks.readLevierAttachment.mockResolvedValueOnce(null);
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await sendOperationalSystemDeliveryEmail({
      assetRevision: "levier-v1-test",
      deliveryId: "lead-levier-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });

    expect(result).toEqual({ sent: false, reason: "missing_asset" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
