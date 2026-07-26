import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  sendSystemKitEmail,
  sendSystemKitFollowupEmail,
} from "@/lib/system-kit-email";

const originalApiKey = process.env.RESEND_API_KEY;
const originalFromEmail = process.env.RESEND_FROM_EMAIL;

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.RESEND_API_KEY = originalApiKey;
  process.env.RESEND_FROM_EMAIL = originalFromEmail;
});

describe("system kit email", () => {
  it("escapes user-controlled values in the HTML body", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "Demaa <team@demaa.fr>";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendSystemKitEmail({
      email: "client@example.com",
      firstName: '<img src=x onerror="alert(1)">',
      idempotencyKey: "system-kit-email-security-test",
      systemName: "Bâtiment & travaux",
      systemSlug: "batiment",
    });

    expect(result.sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body)) as {
      html: string;
      subject: string;
    };

    expect(payload.html).not.toContain('<img src=x onerror="alert(1)">');
    expect(payload.html).toContain(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
    expect(payload.html).toContain("Bâtiment &amp; travaux");
    expect(payload.html).toContain("Votre tableau gratuit est prêt");
    expect(payload.html).toContain(
      "Ce fichier est distinct de la démonstration remplie",
    );
    expect(payload.subject).toBe(
      "Votre tableau gratuit Demaa - Bâtiment & travaux",
    );
  });

  it("présente la construction d’un système personnalisé sur devis", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "Demaa <team@demaa.fr>";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendSystemKitFollowupEmail({
      email: "client@example.com",
      firstName: "Maya",
      kind: "session",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });

    expect(result.sent).toBe(true);
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(request.body)) as {
      html: string;
      subject: string;
    };

    expect(payload.subject).toBe(
      "Besoin d’un système adapté à votre entreprise ?",
    );
    expect(payload.html).toContain("premier échange est offert");
    expect(payload.html).toContain("un périmètre et un devis");
    expect(payload.html).toContain("mettre le système en place");
    expect(payload.html).not.toContain("750 € HT");
    expect(payload.html).not.toContain("session d’adaptation");
  });
});
