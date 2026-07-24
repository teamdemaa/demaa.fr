import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { syncResendNewsletterContact } from "@/lib/resend-audience";

const originalApiKey = process.env.RESEND_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.RESEND_API_KEY = originalApiKey;
});

describe("Resend newsletter contact", () => {
  it("normalizes the email and records an explicit subscription", async () => {
    process.env.RESEND_API_KEY = "test-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: "contact_1" })));
    vi.stubGlobal("fetch", fetchMock);

    await syncResendNewsletterContact({ email: "  CLIENT@EXAMPLE.COM " });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/contacts/client%40example.com",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ unsubscribed: false }),
      }),
    );
  });
});
