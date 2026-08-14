import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  enforceRateLimit: vi.fn(),
  sendCustomerMagicLinkEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/action-plan-storage.server", () => ({
  ACTION_PLAN_ACCESS_COOKIE: "demaa_action_plan_access",
}));
vi.mock("@/lib/customer-space-email", () => ({
  getMagicLinkErrorMessage: () => "email_error",
  sendCustomerMagicLinkEmail: mocks.sendCustomerMagicLinkEmail,
}));
vi.mock("@/lib/api-security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-security")>();
  return { ...actual, enforceRateLimit: mocks.enforceRateLimit };
});

import { POST } from "@/app/api/customer-space/magic-link/route";

function request(body: Record<string, unknown>) {
  return new Request("https://demaa.co/api/customer-space/magic-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
    },
    body: JSON.stringify(body),
  });
}

describe("customer magic-link creation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.co";
    mocks.cookies.mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) });
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.sendCustomerMagicLinkEmail.mockResolvedValue({
      magicLink: "https://demaa.co/connexion?token=test",
      reason: null,
      sent: true,
    });
  });

  it("forwards the canonical email and complete specialist draft return path", async () => {
    const draftToken = "a".repeat(43);
    const returnTo =
      `/plans/plan-123?intent=coaching&tab=messages&draftToken=${draftToken}`;

    const response = await POST(request({
      email: " Dirigeant@Example.com ",
      returnTo,
    }));

    expect(response.status).toBe(200);
    expect(mocks.sendCustomerMagicLinkEmail).toHaveBeenCalledWith({
      actionPlanClaim: null,
      email: "dirigeant@example.com",
      request: expect.any(Request),
      returnTo,
    });
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0",
    );
  });

  it("rejects an unsafe draft return path before sending the link", async () => {
    const response = await POST(request({
      email: "dirigeant@example.com",
      returnTo: "/plans/plan-123?intent=coaching&draftToken=too-short",
    }));

    expect(response.status).toBe(200);
    expect(mocks.sendCustomerMagicLinkEmail).toHaveBeenCalledWith(
      expect.objectContaining({ returnTo: "/" }),
    );
  });
});
