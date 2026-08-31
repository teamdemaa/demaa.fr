import { afterEach, describe, expect, it, vi } from "vitest";
import { sendSystemProcessesPdfEmail } from "@/lib/system-processes-email.server";

const originalApiKey = process.env.RESEND_API_KEY;
const originalFrom = process.env.RESEND_FROM_EMAIL;

afterEach(() => {
  process.env.RESEND_API_KEY = originalApiKey;
  process.env.RESEND_FROM_EMAIL = originalFrom;
  vi.restoreAllMocks();
});

describe("system processes PDF email", () => {
  it("sends the PDF as a base64 attachment through Resend", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "Demaa <bonjour@example.test>";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), { status: 200 }),
    );

    const result = await sendSystemProcessesPdfEmail({
      email: "client@example.test",
      pdfBytes: new Uint8Array([37, 80, 68, 70]),
      requestKey: "web:processes:request-123",
      systemName: "Cabinet comptable",
      systemSlug: "cabinet-comptable",
    });

    expect(result.sent).toBe(true);
    const [, init] = fetchMock.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body));
    expect(body.attachments).toEqual([
      {
        content: Buffer.from([37, 80, 68, 70]).toString("base64"),
        filename: "checklist-processus-cabinet-comptable.pdf",
      },
    ]);
    expect(body.to).toBe("client@example.test");
    expect(init?.headers).toMatchObject({
      "Idempotency-Key": expect.stringMatching(/^demaa-processes-[a-f0-9]{64}$/),
    });
  });

  it("fails closed when the e-mail provider is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;

    await expect(sendSystemProcessesPdfEmail({
      email: "client@example.test",
      pdfBytes: new Uint8Array([37, 80, 68, 70]),
      requestKey: "web:processes:request-123",
      systemName: "Cabinet comptable",
      systemSlug: "cabinet-comptable",
    })).resolves.toEqual({
      reason: "missing_resend_config",
      sent: false,
    });
  });
});
