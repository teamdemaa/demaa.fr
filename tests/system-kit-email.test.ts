import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sendSystemKitEmail } from "@/lib/system-kit-email";

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
    const payload = JSON.parse(String(request.body)) as { html: string };

    expect(payload.html).not.toContain('<img src=x onerror="alert(1)">');
    expect(payload.html).toContain(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
    expect(payload.html).toContain("Bâtiment &amp; travaux");
  });
});
