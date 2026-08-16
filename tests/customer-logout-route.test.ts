import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { DELETE } from "@/app/api/auth/session/route";

describe("customer logout route", () => {
  it("clears the native Firebase session", async () => {
    const response = await DELETE(new Request(
      "https://demaa.co/api/auth/session",
      { method: "DELETE", headers: { Origin: "https://demaa.co" } },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ signedOut: true });
    expect(response.headers.get("set-cookie")).toContain("demaa_session=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(response.headers.get("set-cookie")).not.toContain("demaa_cookie_consent");
  });

  it("rejects a cross-site logout request", async () => {
    const response = await DELETE(new Request(
      "https://demaa.co/api/auth/session",
      { method: "DELETE", headers: { Origin: "https://example.com" } },
    ));

    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
