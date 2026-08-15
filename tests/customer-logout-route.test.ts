import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/customer-space/logout/route";

describe("customer logout route", () => {
  it("clears the native Firebase session and redirects with GET semantics", async () => {
    const response = await POST(new Request(
      "https://demaa.co/api/customer-space/logout?returnTo=%2F",
      { method: "POST", headers: { Origin: "https://demaa.co" } },
    ));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://demaa.co/");
    expect(response.headers.get("set-cookie")).toContain("demaa_session=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects a cross-site logout request", async () => {
    const response = await POST(new Request(
      "https://demaa.co/api/customer-space/logout?returnTo=%2F",
      { method: "POST", headers: { Origin: "https://example.com" } },
    ));

    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
