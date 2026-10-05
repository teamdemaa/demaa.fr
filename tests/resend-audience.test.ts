import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { syncResendNewsletterContact } from "@/lib/resend-audience";

const originalSegment = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
const originalApiKey = process.env.RESEND_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.RESEND_API_KEY = originalApiKey;
  if (originalSegment === undefined) delete process.env.RESEND_NEWSLETTER_SEGMENT_ID; else process.env.RESEND_NEWSLETTER_SEGMENT_ID = originalSegment;
});

describe("Resend newsletter contact", () => {
  it("adds only explicit newsletter subscriptions to the dedicated segment", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_NEWSLETTER_SEGMENT_ID = "newsletter-segment";
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ id: "contact_1" }))));
    vi.stubGlobal("fetch", fetchMock);
    await syncResendNewsletterContact({ email: "client@example.com" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.resend.com/contacts/client%40example.com/segments/newsletter-segment");
  });
  it("normalizes the email and records an explicit subscription", async () => {
    process.env.RESEND_API_KEY = "test-key";
    delete process.env.RESEND_NEWSLETTER_SEGMENT_ID;
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
