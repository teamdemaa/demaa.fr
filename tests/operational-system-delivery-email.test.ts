import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getCopyUrl: vi.fn(),
  getLevierCopyUrl: vi.fn(),
}));

vi.mock("@/lib/editable-operational-system-assets.server", () => ({
  getEditableOperationalSystemCopyUrl: mocks.getCopyUrl,
}));

vi.mock("@/lib/levier-asset.server", () => ({
  LEVIER_ASSET_REVISION: "levier-google-sheet-v1-test",
  LEVIER_LEGACY_ATTACHMENT_REVISION: "levier-v1-test",
  getLevierCopyUrl: mocks.getLevierCopyUrl,
}));

import { sendOperationalSystemDeliveryEmail } from "@/lib/operational-system-delivery-email.server";

const LEVIER_COPY_URL = "https://example.invalid/levier-copy-test";

describe("operational system delivery email", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RESEND_FROM_EMAIL", "Demaa <systemes@demaa.fr>");
    mocks.getCopyUrl.mockReturnValue(
      "https://example.invalid/private-copy",
    );
    mocks.getLevierCopyUrl.mockReturnValue(LEVIER_COPY_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends the historical system link without changing its named flow", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), { status: 200 }),
    );

    const result = await sendOperationalSystemDeliveryEmail({
      assetSnapshot: {
        assetRevision: "d032-v1-2026-07-28",
        workbookVersion: "1.0.0",
      },
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
    expect(payload.html).toContain("Bonjour Maya");
    expect(payload.html).toContain("Créer ma copie dans Google Drive");
    expect(payload.text).toContain("https://example.invalid/private-copy");
  });

  it("does not call Resend when the historical editable asset is missing", async () => {
    mocks.getCopyUrl.mockReturnValueOnce(null);
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await sendOperationalSystemDeliveryEmail({
      assetSnapshot: {
        assetRevision: "d032-v1-2026-07-28",
        workbookVersion: "1.0.0",
      },
      deliveryId: "lead-123-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Système inconnu",
      systemSlug: "systeme-inconnu",
    });

    expect(result).toEqual({ sent: false, reason: "missing_asset" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the immutable Levier /copy link without a name or attachment", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "email_levier" }), { status: 200 }),
    );
    const assetSnapshot = {
      assetRevision: "levier-google-sheet-v1-test",
      resourceId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890",
      workbookVersion: "1.0.0",
    };

    const result = await sendOperationalSystemDeliveryEmail({
      assetSnapshot,
      deliveryId: "lead-levier-system",
      email: "maya@example.com",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });

    expect(result).toEqual({ sent: true, reason: null });
    expect(mocks.getCopyUrl).not.toHaveBeenCalled();
    expect(mocks.getLevierCopyUrl).toHaveBeenCalledWith(assetSnapshot);

    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(init?.body)) as Record<string, unknown> & {
      html: string;
      subject: string;
      text: string;
    };
    expect(payload).not.toHaveProperty("attachments");
    expect(payload.subject).toBe("Votre ressource Demaa - Tableau de pilotage opérationnel");
    expect(payload.html).toContain("Ouvrir la ressource");
    expect(payload.html).not.toContain("Levier");
    expect(payload.html).toContain(LEVIER_COPY_URL);
    expect(payload.text).toContain(LEVIER_COPY_URL);
    expect(`${payload.html}${payload.text}`).not.toContain("Maya");
    expect(`${payload.html}${payload.text}`).not.toContain("Plomberie");
    expect(`${payload.html}${payload.text}`).not.toContain(".xlsx");
  });

  it("fails closed before calling Resend when the Levier snapshot is invalid", async () => {
    mocks.getLevierCopyUrl.mockReturnValueOnce(null);
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await sendOperationalSystemDeliveryEmail({
      assetSnapshot: {
        assetRevision: "levier-google-sheet-v1-test",
        resourceId: "invalid",
        workbookVersion: "1.0.0",
      },
      deliveryId: "lead-levier-system",
      email: "maya@example.com",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });

    expect(result).toEqual({ sent: false, reason: "missing_asset" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the canonical system recap link", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "email_recap" }), { status: 200 }),
    );

    const result = await sendOperationalSystemDeliveryEmail({
      assetSnapshot: {
        assetRevision: "recapitulatif-systeme-v1-2026-08-08",
        resourceId: "recapitulatif-systeme",
        workbookVersion: "1.0.0",
      },
      deliveryId: "lead-recap-system",
      email: "maya@example.com",
      systemName: "Cabinet comptable",
      systemSlug: "cabinet-comptable",
    });

    expect(result).toEqual({ sent: true, reason: null });
    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(init?.body)) as {
      html: string;
      subject: string;
      text: string;
    };
    expect(payload.subject).toBe("Votre ressource Demaa - Récapitulatif du système");
    expect(payload.html).toContain(
      "https://demaa.fr/kit-operationnel/cabinet-comptable/recapitulatif",
    );
    expect(payload.text).toContain(
      "https://demaa.fr/kit-operationnel/cabinet-comptable/recapitulatif",
    );
  });

  it("never falls through a retired attachment revision to a system workbook", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await sendOperationalSystemDeliveryEmail({
      assetSnapshot: {
        assetRevision: "levier-v1-test",
        workbookVersion: "1.0.0",
      },
      deliveryId: "lead-levier-legacy-system",
      email: "maya@example.com",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });

    expect(result).toEqual({ sent: false, reason: "missing_asset" });
    expect(mocks.getCopyUrl).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
